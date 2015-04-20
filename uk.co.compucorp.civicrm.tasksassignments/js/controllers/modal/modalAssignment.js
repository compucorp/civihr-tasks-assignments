define(['controllers/controllers',
        'services/contact',
        'services/assignment'], function(controllers){
    controllers.controller('ModalAssignmentCtrl',['$scope', '$modalInstance', '$rootScope', '$q', '$log', '$filter',
         'AssignmentService', 'TaskService', 'ContactService', 'data', 'config',
        function($scope, $modalInstance, $rootScope, $q, $log, $filter, AssignmentService, TaskService, ContactService,
                 data, config){
            $log.debug('Controller: ModalAssignmentCtrl');

            $scope.assignment = {};
            $scope.assignment.status_id = '1';
            $scope.assignment.contact_id = config.CONTACT_ID;
            $scope.assignment.client_id = config.CONTACT_ID;
            $scope.assignment.subject = '';

            $scope.contacts = $rootScope.cache.contact.arrSearch;
            $scope.dpOpened = {};
            $scope.showCId = !config.CONTACT_ID;
            $scope.taskSet = {};
            $scope.taskList = [];

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

            $scope.setAssignmentDueDate = function(taskDateDue){
                if (!$scope.assignment.end_date || $scope.assignment.end_date < taskDateDue) {
                    $scope.assignment.end_date = taskDateDue;
                }
            }

            $scope.setData = function() {
                var assignmentType = $rootScope.cache.assignmentType[$scope.assignment.case_type_id];
                $scope.taskSet = assignmentType ? assignmentType.definition.activitySets[0] : {};
                $scope.assignment.subject = $rootScope.cache.assignmentType[$scope.assignment.case_type_id].title;
            }

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            }

            $scope.confirm = function(){

                var taskListAssignment = $filter('filter')($scope.taskList, {create: true}, true);

                AssignmentService.save($scope.assignment).then(function(resultAssignment) {

                    TaskService.saveMultiple(taskListAssignment).then(function(resultTask){
                        var i = 0, len = resultTask.length, taskArr = [];

                        for (i; i < len; i++) {
                            taskArr.push(resultTask[i].id)
                        }

                        return TaskService.assign(taskArr, resultAssignment.id);

                    },function(reason){
                        CRM.alert(reason, 'Error', 'error');
                        $modalInstance.dismiss();
                        return $q.reject();
                    }).then(function(results){
                        $modalInstance.close(taskListAssignment);
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

    controllers.controller('ModalAssignmentTaskCtrl',['$scope', '$log', '$filter', '$rootScope', 'config',
        function($scope, $log, $filter, $rootScope, config){
            $log.debug('Controller: ModalAssignmentTaskCtrl');

            var taskType = $filter('filter')($rootScope.cache.taskType.arr, { value: $scope.task.name }, true)[0];

            $scope.isDisabled = !taskType;
            $scope.task.create = !!taskType;
            $scope.task.status_id = '1';
            $scope.task.activity_type_id = taskType ? taskType.key : null;
            $scope.task.target_contact_id = [$scope.$parent.assignment.contact_id];
            $scope.task.source_contact_id = config.LOGGED_IN_CONTACT_ID;

            $scope.$watch('$parent.assignment.end_date',function(assignmentDueDate){
                if (!$scope.task.activity_date_time || $scope.task.activity_date_time > assignmentDueDate) {
                    $scope.task.activity_date_time = assignmentDueDate;
                }
            });

        }]);
});