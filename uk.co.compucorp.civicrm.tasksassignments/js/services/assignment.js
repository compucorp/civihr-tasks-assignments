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

    services.factory('AssignmentType',['$resource', 'config', '$log', function($resource, config, $log){
        $log.debug('Service: AssignmentType');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'CaseType',
            'json': {}
        });

    }]);

    services.factory('AssignmentService',['Relationship', 'Assignment', 'AssignmentType', '$q', 'config', 'UtilsService', '$location',
        '$route', '$log',
        function(Relationship, Assignment, AssignmentType, $q, config, UtilsService, $location, $route, $log){
        $log.debug('Service: AssignmentService');

        return {
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

            }

        }

    }]);

});