define(['controllers/controllers',
        'services/contact',
        'services/dialog',
        'services/task'], function(controllers){

    controllers.controller('ModalTaskMigrateCtrl',['$scope', '$modalInstance', '$rootScope', '$rootElement', '$q', '$log', '$filter',
        '$modal', '$dialog', 'AssignmentService', 'TaskService', 'ContactService', 'config',
        function($scope, $modalInstance, $rootScope, $rootElement, $q, $log, $filter, $modal, $dialog, AssignmentService,
                 TaskService, ContactService, config){
            $log.debug('Controller: ModalTaskMigrateCtrl');

            $scope.migrate = {
                from: '',
                to: '',
                taskList: []
            };

            $scope.contacts = $rootScope.cache.contact.arrSearch;

            $scope.getTasks = function(contactId){

                contactId = contactId || $scope.migrate.from;

                TaskService.get({
                    'component': '',
                    'sequential': 0,
                    'assignee_contact_id': contactId
                }).then(function(results){
                    $scope.migrate.taskList = results;
                }, function (reason) {
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    $scope.$broadcast('ct-spinner-hide');
                    return $q.reject();
                });
            };

            $scope.refreshContacts = function(input){
                if (!input) {
                    return
                }

                ContactService.search(input, {
                    contact_type: 'Individual'
                }).then(function(results){
                    $scope.contacts = results;
                });
            };

            $scope.cacheContact = function($item){
                var obj = {};

                obj[$item.id] = {
                    contact_id: $item.id,
                    contact_type: $item.icon_class,
                    sort_name: $item.label,
                    email: $item.description.length ? $item.description[0] : ''
                };

                ContactService.updateCache(obj);
            };

            $scope.cancel = function(){

                if ($scope.taskMigrateForm.$pristine) {
                    $modalInstance.dismiss('cancel');
                    return
                }

                $dialog.open({
                    copyCancel: 'No',
                    msg: 'Are you sure you want to cancel? Changes will be lost!'
                }).then(function(confirm){
                    if (!confirm) {
                        return
                    }

                    $scope.$broadcast('ct-spinner-hide');
                    $modalInstance.dismiss('cancel');
                });

            };

            $scope.confirm = function(){

                $scope.$broadcast('ct-spinner-show');

                $modalInstance.dismiss();
                $scope.$broadcast('ct-spinner-hide');

            }

        }]);
});