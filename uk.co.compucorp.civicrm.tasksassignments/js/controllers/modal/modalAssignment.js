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

            $scope.setAssignmentDueDate = function(taskDateDue){
                if (!$scope.assignment.end_date || $scope.assignment.end_date < taskDateDue) {
                    $scope.assignment.end_date = taskDateDue;
                }
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
                console.log($item);
                console.log($rootScope.cache.contact);
            };

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            }

            $scope.confirm = function(){

                AssignmentService.save($scope.assignment).then(function(resultAssignment){

                    var promiseTaskCreate = [], promiseTaskAssign = [];

                    angular.forEach($scope.taskList, function(task){
                        if (task.create) {
                            promiseTaskCreate.push(TaskService.save(task));
                        }
                    });

                    $q.all(promiseTaskCreate).then(function(resultTask){
                        angular.forEach(resultTask, function(task){
                            promiseTaskAssign.push(TaskService.save({
                                    sequential: 1,
                                    id: task.id,
                                    case_id: resultAssignment.id
                                }
                            ));
                        });

                        return $q.all(promiseTaskAssign);

                    }).then(function(results){
                        console.log($scope.taskList);
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

    controllers.controller('ModalAssignmentTaskCtrl',['$scope', '$log', '$filter', '$rootScope', 'config',
        function($scope, $log, $filter, $rootScope, config){
            $log.debug('Controller: ModalAssignmentTaskCtrl');

            var taskType = $filter('filter')($rootScope.cache.taskType.arr, { value: $scope.task.name }, true)[0];

            $scope.isDisabled = !taskType;
            $scope.task.create = !!taskType;
            $scope.task.status_id = 1;
            $scope.task.activity_type_id = taskType ? taskType.key : null;
            $scope.task.target_contact_id = $scope.$parent.assignment.contact_id;
            $scope.task.source_contact_id = config.LOGGED_IN_CONTACT_ID;

            $scope.$watch('$parent.assignment.end_date',function(assignmentDueDate){
                if (!$scope.task.activity_date_time || $scope.task.activity_date_time > assignmentDueDate) {
                    $scope.task.activity_date_time = assignmentDueDate;
                }
            });

        }]);
});