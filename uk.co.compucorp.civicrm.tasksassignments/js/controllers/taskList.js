define(['controllers/controllers',
        'services/contact',
        'services/task',
        'services/assignment'], function(controllers){

    controllers.controller('TaskListCtrl',['$scope', '$modal', '$rootElement', '$rootScope', '$filter', '$log', 'taskList',
        'config', 'ContactService', 'TaskService', 'AssignmentService',
        function($scope, $modal, $rootElement, $rootScope, $filter, $log, taskList, config, ContactService, TaskService,
                 AssignmentService){
            $log.debug('Controller: TaskListCtrl');

            this.init = function(){
                var contactIds = this.contactIds;

                if (taskList.length) {
                    this.collectCId(taskList);
                }

                if (contactIds && contactIds.length) {
                    ContactService.get({'IN': contactIds}).then(function(data){
                        ContactService.updateCache(data);
                        console.log($rootScope.cache);
                    });
                }
            }

            this.contactIds = [];

            this.collectCId = function(taskList){
                var contactIds = this.contactIds;

                angular.forEach(taskList,function(task){
                    contactIds.push(task.source_contact_id);

                    if (task.assignee_contact_id && task.assignee_contact_id.length) {
                        contactIds.push(task.assignee_contact_id[0]);
                    }

                    if (task.target_contact_id && task.target_contact_id.length) {
                        contactIds.push(task.target_contact_id[0]);
                    }

                });
            }

            $scope.filterByContact = null;

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

            this.init();

        }]);
});