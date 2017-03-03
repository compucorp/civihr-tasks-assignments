define([
    'tasks-assignments/services/services',
    'tasks-assignments/services/utils'
], function (services) {
    'use strict';

    services.factory('Relationship',['$resource', 'config', '$log', function ($resource, config, $log) {
        $log.debug('Service: Relationship');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'Relationship',
            'json': {}
        });

    }]);

    services.factory('Assignment',['$resource', 'config', '$log', function ($resource, config, $log) {
        $log.debug('Service: Assignment');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'Assignment',
            'json': {}
        });

    }]);

    services.factory('AssignmentSearch',['$resource', 'config', '$log', function ($resource, config, $log) {
        $log.debug('Service: AssignmentSearch');

        return $resource(config.url.ASSIGNMENTS+'/ajax/unclosed');

    }]);

    services.factory('AssignmentType',['$resource', 'config', '$log', function ($resource, config, $log) {
        $log.debug('Service: AssignmentType');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'CaseType',
            'json': {
                'is_active': 1
            }
        });

    }]);

    services.factory('AssignmentService',['Relationship', 'Assignment', 'AssignmentSearch', 'AssignmentType', '$q', 'config', 'UtilsService',
        '$filter', '$location', '$state', '$rootScope', '$log', '$timeout',
        function (Relationship, Assignment, AssignmentSearch, AssignmentType, $q, config, UtilsService, $filter, $location, $state,
                 $rootScope, $log, $timeout) {
        $log.debug('Service: AssignmentService');

        return {
            get: function(id) {

                if (!id || (typeof +id !== 'number' && typeof id !== 'object') ) {
                    return null
                }

                var deferred = $q.defer();

                Assignment.get({
                    'json': {
                        'options': {
                            'limit': 0
                        },
                        'id': id,
                        'debug': config.DEBUG
                    }}, function(data){

                    if (UtilsService.errorHandler(data,'Unable to fetch assignments',deferred)) {
                        return
                    }

                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to fetch assignments');
                });

                return deferred.promise;
            },
            assignCoordinator: function(contactId, assignmentId){

                if ((!contactId || typeof +contactId !== 'number') ||
                    (!assignmentId || typeof +assignmentId !== 'number')) {
                    return null;
                }

                var deferred = $q.defer();

                Relationship.save({
                    action: 'create',
                    json: {
                        sequential: 1,
                        contact_id_a: contactId,
                        contact_id_b: config.LOGGED_IN_CONTACT_ID,
                        relationship_type_id: 9,
                        case_id: assignmentId
                    }
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to assign coordinator',deferred)) {
                        return
                    }

                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to assign coordinator');
                });

                return deferred.promise;
            },
            getTypes: function(){
                var deferred = $q.defer();

                AssignmentType.get({}, function(data){
                    if (UtilsService.errorHandler(data,'Unable to fetch assignment types',deferred)) {
                        return
                    }

                    deferred.resolve(data.values);

                },function(){
                    deferred.reject('Unable to fetch assignment types');
                });

                return deferred.promise;
            },
            save: function(assignment){

                if (!assignment || typeof assignment !== 'object') {
                    return null;
                }

                var deferred = $q.defer(),
                    params = angular.extend({
                        sequential: 1,
                        debug: config.DEBUG
                    },assignment),
                    val;

                Assignment.save({
                    action: 'create',
                    json: params
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to save an assignment',deferred)) {
                        return
                    }

                    val = data.values;
                    deferred.resolve(val.length == 1 ? val[0] : null);
                },function(){
                    deferred.reject('Unable to save an assignment');
                });

                return deferred.promise;

            },
            search: function(input, excludeCaseId, includeContactIds){
              return AssignmentSearch.query({
                sortName: input,
                excludeCaseIds: excludeCaseId,
                includeContactIds: includeContactIds.join(',')
              }).$promise;
            },
            updateTab: function(count) {
                if (document.getElementsByClassName('CRM_Case_Form_Search').length) {
                    CRM.refreshParent('.CRM_Case_Form_Search');
                    return;
                }

                if (!!document.getElementById('tab_case')) {
                    CRM.tabHeader.updateCount('#tab_case', CRM.tabHeader.getCount('#tab_case')+(count || 0));
                    return
                }

                if ($location.path() == '/assignments') {
                    $state.reload(true);
                }
            },
            updateCache: function(data){
                $log.debug('updateCache');
                $log.debug(data);

                var obj = $rootScope.cache.assignment.obj || {}, arr = [], arrSearch = [], assignment, assignmentId,
                    assignmentType;

                angular.extend(obj,data);

                for (assignmentId in obj) {
                    assignment = obj[assignmentId];
                    assignmentType = $rootScope.cache.assignmentType.obj[assignment.case_type_id].title;
                    arr.push(assignment);

                    arrSearch.push({
                        label: assignment.contacts[0].sort_name + ' - ' + assignmentType + (assignment.end_date ? ' (closed)' : ''),
                        label_class: +assignment.is_deleted || assignment.end_date ? 'strikethrough' : '',
                        id: assignmentId,
                        extra: {
                            case_subject: assignment.subject,
                            case_type: assignmentType,
                            contact_id: assignment.contacts[0].contact_id,
                            end_date: assignment.end_date,
                            sort_name: assignment.contacts[0].sort_name,
                            start_date: assignment.start_date
                        }
                    });

                }

                arr = $filter('orderBy')(arr, 'subject');
                arrSearch = $filter('orderBy')(arrSearch, 'label');

                $rootScope.cache.assignment = {
                    arr: arr,
                    obj: obj,
                    arrSearch: arrSearch
                };
            }
        }

    }]);

});
