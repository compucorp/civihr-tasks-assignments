define(['controllers/controllers',
        'services/contact',
        'services/task'], function(controllers){

    controllers.controller('ModalReminderCtrl',['$scope', '$modalInstance', '$rootScope', '$q', '$log', '$filter',
        'TaskService', 'data', 'config',
        function($scope, $modalInstance, $rootScope, $q, $log, $filter, TaskService,
                 data, config){
            $log.debug('Controller: ModalReminderCtrl');

            $scope.task = {};

            angular.copy(data,$scope.task);

            $scope.reminder = {};
            $scope.task.assignee_contact_id = $scope.task.assignee_contact_id || [];
            $scope.task.target_contact_id = $scope.task.target_contact_id || [config.CONTACT_ID];
            $scope.contacts = $rootScope.cache.contact.arrSearch;
            $scope.showCId = !config.CONTACT_ID;

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            };

            $scope.confirm = function(){
                console.log($scope.task);
                console.log(angular.equals($scope.task,data));

                $scope.task.activity_date_time = $scope.task.activity_date_time || new Date();

                TaskService.sendReminder($scope.task.id, $scope.reminder.notes).then(function(){
                    CRM.alert('Message sent to: '+$rootScope.cache.contact.obj[task.assignee_contact_id[0]].sort_name,
                        'Reminder sent','success');
                    $modalInstance.close();
                },function(reason){
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    return $q.reject();
                });

            }

        }]);
});