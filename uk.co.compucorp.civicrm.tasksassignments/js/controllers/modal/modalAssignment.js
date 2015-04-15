define(['controllers/controllers',
        'services/contact',
        'services/assignment'], function(controllers){
    controllers.controller('ModalAssignmentCtrl',['$scope', '$modalInstance', '$rootScope', '$q', '$log', '$filter',
         'AssignmentService', 'TaskService', 'ContactService', 'data', 'config',
        function($scope, $modalInstance, $rootScope, $q, $log, $filter, AssignmentService, TaskService, ContactService,
                 data, config){
            $log.debug('Controller: ModalAssignmentCtrl');

            $scope.assignment = {};

            //angular.copy(data,$scope.assignment);
/*
            $scope.assignment.assignee_contact_id = $scope.assignment.assignee_contact_id || [];
            $scope.assignment.source_contact_id = $scope.assignment.source_contact_id || config.LOGGED_IN_CONTACT_ID;
            $scope.assignment.target_contact_id = $scope.assignment.target_contact_id || [config.CONTACT_ID];

            */
            $scope.assignment.status_id = 1;
            $scope.assignment.contact_id = config.CONTACT_ID;
            $scope.assignment.client_id = config.CONTACT_ID;
            $scope.assignment.subject = '';

            $scope.contacts = $rootScope.cache.contact.arrSearch;
            $scope.dpOpened = {};
            $scope.showCId = !config.CONTACT_ID;
            $scope.taskSet = {};
            $scope.taskList = [];

            $scope.setData = function() {
                var assignmentType = $rootScope.cache.assignmentType[$scope.assignment.case_type_id];
                $scope.taskSet = assignmentType ? assignmentType.definition.activitySets[0] : {};
                $scope.assignment.subject = $rootScope.cache.assignmentType[$scope.assignment.case_type_id].title;
            }

            $scope.dpOpen = function($event, key){
                $event.preventDefault();
                $event.stopPropagation();

                $scope.dpOpened[key] = true;

            }

            $scope.refreshContacts = function(input){
                if (!input) {
                    return
                }

                ContactService.search(input).then(function(results){
                    $scope.contacts = results;
                });
            }

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            }

            $scope.confirm = function(){

                AssignmentService.save($scope.assignment).then(function(results){
                    console.log(results);

                    var promiseTaskCreate = [];

                    angular.forEach($scope.taskList, function(task){
                        promiseTaskCreate.push(TaskService.save(task));
                    });

                    $q.all(promiseTaskCreate).then(function(results){
                        console.log(results)
                        $modalInstance.close(angular.copy($scope.taskList));
                    });

                },function(reason){
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    return $q.reject();
                });

            }

            $scope.$watch('taskSet',function(taskSet){
                angular.copy(taskSet.activityTypes, $scope.taskList);
            });

        }]);

    controllers.controller('ModalAssignmentTaskCtrl',['$scope', '$log',
        function($scope, $log){
            $log.debug('Controller: ModalAssignmentTaskCtrl');

            $scope.task.create = true;
            $scope.task.status_id = 1;

            $scope.setAssignmentDueDate = function(){
                if (!$scope.$parent.assignment.end_date || $scope.$parent.assignment.end_date < $scope.task.due) {
                    $scope.$parent.assignment.end_date = $scope.task.due;
                }
            }

            $scope.$watch('$parent.assignment.end_date',function(assignmentDueDate){
                if (!$scope.task.due || $scope.task.due > assignmentDueDate) {
                    $scope.task.due = assignmentDueDate;
                }
            });

        }]);
});