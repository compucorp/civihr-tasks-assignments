define([
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/services/contact.service',
    'tasks-assignments/services/dialog.service',
    'tasks-assignments/services/document.service',
    'tasks-assignments/services/task.service'
], function (controllers) {
    'use strict';

    controllers.controller('ModalReminderCtrl',['$scope', '$uibModalInstance', '$dialog', '$rootScope', '$q', '$log', '$filter',
        'TaskService', 'DocumentService', 'data', 'type', 'config',
        function ($scope, $modalInstance, $dialog, $rootScope, $q, $log, $filter, TaskService, DocumentService,
                 data, type, config) {
            $log.debug('Controller: ModalReminderCtrl');

            $scope.data = {};
            $scope.type = type;

            angular.copy(data,$scope.data);

            $scope.reminder = {};
            $scope.data.assignee_contact_id = $scope.data.assignee_contact_id || [];
            $scope.data.target_contact_id = $scope.data.target_contact_id || [config.CONTACT_ID];
            $scope.contacts = $rootScope.cache.contact.arrSearch;
            $scope.showCId = !config.CONTACT_ID;

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            };

            $scope.confirm = function(){

                $scope.$broadcast('ct-spinner-show');

                (type === 'task' ? TaskService : DocumentService).sendReminder($scope.data.id, $scope.reminder.notes).then(function(){
                    CRM.alert('Message sent to: '+$rootScope.cache.contact.obj[$scope.data.assignee_contact_id[0]].sort_name,
                        'Reminder sent','success');
                    $modalInstance.close();
                    $scope.$broadcast('ta-spinner-hide');
                    return
                },function(reason){
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    $scope.$broadcast('ta-spinner-hide');
                    return $q.reject();
                });

            }
        }]);
});
