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
            $scope.assignment.client_id = $scope.assignment.contact_id;
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

            $scope.setAssignmentDueDate = function(taskDueDate){
                if (!$scope.assignment.dueDate || $scope.assignment.dueDate < taskDueDate) {
                    $scope.assignment.dueDate = taskDueDate;
                }
            }

            $scope.setData = function() {
                var assignmentType = $rootScope.cache.assignmentType.obj[$scope.assignment.case_type_id];
                $scope.taskSet = assignmentType ? assignmentType.definition.activitySets[0] : {};
                $scope.assignment.subject = $rootScope.cache.assignmentType.obj[$scope.assignment.case_type_id].title;
            }

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            }

            $scope.confirm = function(){

                var taskListAssignment = [], taskArr = [], cacheAssignmentObj = {}, i, len;

                $scope.assignment.start_date = new Date();

                AssignmentService.save($scope.assignment).then(function(resultAssignment) {

                    angular.forEach($scope.taskList, function(task){
                        if (task.create) {
                            task.case_id = resultAssignment.id;
                            this.push(task);
                        }
                    },taskListAssignment);

                    TaskService.saveMultiple(taskListAssignment).then(function(resultTask){
                        i = 0, len = resultTask.length;

                        for (i; i < len; i++) {
                            taskArr.push(resultTask[i].id)
                        }

                        return $q.all({
                            assignedTasks: TaskService.assign(taskArr, resultAssignment.id),
                            relationship: AssignmentService.assignCoordinator($scope.assignment.contact_id, resultAssignment.id)
                        });

                    },function(reason){
                        CRM.alert(reason, 'Error', 'error');
                        $modalInstance.dismiss();
                        return $q.reject();
                    }).then(function(results){
                        i = 0, len = results.assignedTasks.length;

                        for (i; i < len; i++) {
                            taskArr.push(results.assignedTasks[i].id)
                        }

                        cacheAssignmentObj[resultAssignment.id] = angular.extend(angular.copy($scope.assignment),{
                            id: resultAssignment.id,
                            client_id: {
                                '1': $scope.assignment.client_id
                            },
                            contact_id: {
                                '1': $scope.assignment.contact_id
                            },
                            contacts: [
                                {
                                    sort_name: $rootScope.cache.contact.obj[$scope.assignment.contact_id].sort_name,
                                    contact_id: $scope.assignment.contact_id,
                                    role: 'Client'
                                },
                                {
                                    sort_name: $rootScope.cache.contact.obj[config.LOGGED_IN_CONTACT_ID].sort_name,
                                    contact_id: config.LOGGED_IN_CONTACT_ID,
                                    role: 'Case Coordinator'
                                }
                            ],
                            is_deleted: '0',
                            end_date: '',
                            activities: taskArr
                        });

                        AssignmentService.updateCache(cacheAssignmentObj);
                        AssignmentService.updateTab(1);
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
            $scope.task.assignee_contact_id = [];
            $scope.task.target_contact_id = [$scope.$parent.assignment.contact_id];
            $scope.task.source_contact_id = config.LOGGED_IN_CONTACT_ID;

            $scope.$watch('$parent.assignment.dueDate',function(assignmentDueDate){
                if (!$scope.task.activity_date_time || $scope.task.activity_date_time > assignmentDueDate) {
                    $scope.task.activity_date_time = assignmentDueDate;
                }
            });

        }]);
});