define(['services/services',
        'services/utils'], function (services) {

    services.factory('Relationship',['$resource', 'config', '$log', function($resource, config, $log){
        $log.debug('Service: Relationship');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'Relationship',
            'json': {}
        });

    }]);

    services.factory('Assignment',['$resource', 'config', '$log', function($resource, config, $log){
        $log.debug('Service: Assignment');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'Assignment',
            'json': {}
        });

    }]);

    services.factory('AssignmentSearch',['$resource', 'config', '$log', function($resource, config, $log){
        $log.debug('Service: AssignmentSearch');

        return $resource(config.url.ASSIGNMENTS+'/ajax/unclosed');

    }]);

    services.factory('AssignmentType',['$resource', 'config', '$log', function($resource, config, $log){
        $log.debug('Service: AssignmentType');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'CaseType',
            'json': {}
        });

    }]);

    services.factory('AssignmentService',['Relationship', 'Assignment', 'AssignmentSearch', 'AssignmentType', '$q', 'config', 'UtilsService',
        '$filter', '$location', '$route', '$rootScope', '$log',
        function(Relationship, Assignment, AssignmentSearch, AssignmentType, $q, config, UtilsService, $filter, $location, $route,
                 $rootScope, $log){
        $log.debug('Service: AssignmentService');

        return {
            get: function(id) {

                if (!id || (typeof +id !== 'number' && typeof id !== 'object') ) {
                    return null
                }

                var deferred = $q.defer();

                Assignment.get({
                    'json': {
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
            search: function(input, excludeId){
                return AssignmentSearch.query({
                    term: input,
                    excludeCaseIds: excludeId
                }).$promise;
            },
            updateTab: function(count) {

                if (angular.element('.CRM_Case_Form_Search').length) {
                    CRM.refreshParent('.CRM_Case_Form_Search');
                    return;
                }

                if (angular.element('#tab_case').length) {
                    CRM.tabHeader.updateCount('#tab_case', CRM.tabHeader.getCount('#tab_case')+(count || 0));
                    return
                }

                if ($location.path() == '/assignments') {
                    $route.reload();
                }

            },
            updateCache: function(data){
                console.log('updateCache');
                console.log(data);

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
                        id: assignmentId
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