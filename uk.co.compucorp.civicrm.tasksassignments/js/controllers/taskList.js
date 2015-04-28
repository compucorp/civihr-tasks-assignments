define(['controllers/controllers',
        'services/contact',
        'services/task',
        'services/assignment'], function(controllers){

    controllers.controller('TaskListCtrl',['$scope', '$modal', '$rootElement', '$rootScope', '$route', '$filter',
        '$log', 'taskList', 'config', 'ContactService', 'AssignmentService', 'TaskService',
        function($scope, $modal, $rootElement, $rootScope, $route, $filter, $log, taskList, config, ContactService,
                 AssignmentService, TaskService){
            $log.debug('Controller: TaskListCtrl');

            this.init = function(){
                var contactIds = this.contactIds,
                    assignmentIds = this.assignmentIds;

                this.collectId(taskList);

                if (contactIds && contactIds.length) {
                    ContactService.get({'IN': contactIds}).then(function(data){
                        ContactService.updateCache(data);
                    });
                }

                if (assignmentIds && assignmentIds.length) {
                    AssignmentService.get({'IN': assignmentIds}).then(function(data){
                        AssignmentService.updateCache(data);
                    });
                }

                console.log($rootScope.cache);
            }

            this.assignmentIds = [];
            this.contactIds = [];

            this.collectId = function(taskList){
                var contactIds = this.contactIds,
                    assignmentIds = this.assignmentIds;

                contactIds.push(config.LOGGED_IN_CONTACT_ID);

                if (config.CONTACT_ID) {
                    contactIds.push(config.CONTACT_ID);
                }

                function collectCId(task) {
                    contactIds.push(task.source_contact_id);

                    if (task.assignee_contact_id && task.assignee_contact_id.length) {
                        contactIds.push(task.assignee_contact_id[0]);
                    }

                    if (task.target_contact_id && task.target_contact_id.length) {
                        contactIds.push(task.target_contact_id[0]);
                    }
                }

                function collectAId(task) {
                    if (task.case_id) {
                        assignmentIds.push(task.case_id);
                    }
                }

                angular.forEach(taskList,function(task){
                    collectCId(task);
                    collectAId(task);
                });
            }

            $scope.filterByContact = null;
            //$scope.filterByAssignmentType = [];

            $scope.taskList = taskList;

            $scope.tasksFilterFn = {
                overdue: function(task){
                    return new Date(task.activity_date_time).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
                },
                dueToday: function(task){
                    return new Date(task.activity_date_time).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0);
                },
                dueThisWeek: function(task){
                    var d = new Date(),
                        day = d.getDay(),
                        diff = d.getDate() - day + (day == 0 ? -6:1),
                        mon = new Date(d.setDate(diff)),
                        sun = new Date(d.setDate(mon.getDate()+7)),
                        taskDateTime = new Date(task.activity_date_time).setHours(0, 0, 0, 0);

                    return  taskDateTime >= mon.setHours(0, 0, 0, 0) && taskDateTime < sun.setHours(0, 0, 0, 0);
                },
                myTasks: function(task){
                    return task.assignee_contact_id == config.LOGGED_IN_CONTACT_ID
                },
                delegatedTasks: function(task){
                    return task.source_contact_id == config.LOGGED_IN_CONTACT_ID
                }
                /*
                ,
                assignmentType: function(task){
                    console.log(task.case_id);
                    console.log($scope.filterByAssignmentType);
                    //return $scope.filterByAssignmentType.indexOf(task.case_id) !== -1
                }
                */
            }

            $scope.dueToday = 0;
            $scope.dueThisWeek = 0;
            $scope.overdue = 0;

            $rootScope.modalTask = function(data) {
                    var data = data || {},
                    modalInstance = $modal.open({
                        targetDomEl: $rootElement.find('div').eq(0),
                        templateUrl: config.path.TPL+'modal/task.html?v='+(new Date().getTime()),
                        controller: 'ModalTaskCtrl',
                        resolve: {
                            data: function(){
                                return data;
                            }
                        }
                    });

                modalInstance.result.then(function(results){
                    angular.equals({}, data) ? $scope.taskList.push(results) : angular.extend(data,results);
                }, function(){
                    $log.info('Modal dismissed');
                });

            };

            $rootScope.modalAssignment = function(data) {
                var data = data || {},
                    modalInstance = $modal.open({
                        targetDomEl: $rootElement.find('div').eq(0),
                        templateUrl: config.path.TPL+'modal/assignment.html?v='+(new Date().getTime()),
                        controller: 'ModalAssignmentCtrl',
                        size: 'lg',
                        resolve: {
                            data: function(){
                                return data;
                            }
                        }
                    });

                modalInstance.result.then(function(results){
                    Array.prototype.push.apply($scope.taskList,results);
                }, function(){
                    $log.info('Modal dismissed');
                });

            };

            $scope.deleteTask = function(task){
                 TaskService.delete(task.id).then(function(results){
                     $scope.taskList.splice($scope.taskList.indexOf(task),1);
                 });
            }

            $scope.$on('crmFormSuccess',function(e, data){
                if (data.status == 'success')  {
                    var pattern = /case|activity/i;

                    if (pattern.test(data.title) ||
                        data.crmMessages.length &&
                        (pattern.test(data.crmMessages[0].title) ||
                        pattern.test(data.crmMessages[0].text))) {
                        $rootScope.cache.assignment = {};
                        $route.reload();
                    }
                }
            });

            //$scope.filterByAssignmentType = [];
            /*
            $scope.$watchCollection('filterByAssignmentType.selected',function(newVal, oldVal){
                console.log(newVal);
                console.log(oldVal);
            });
            */

            this.init();

        }]);
});