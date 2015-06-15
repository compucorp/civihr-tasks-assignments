define(['controllers/controllers',
        'moment',
        'services/contact',
        'services/dialog',
        'services/task',
        'services/assignment'], function(controllers, moment){

    controllers.controller('TaskListCtrl',['$scope', '$modal', '$dialog', '$rootElement', '$rootScope', '$route', '$filter',
        '$timeout', '$log', 'taskList', 'config', 'ContactService', 'AssignmentService', 'TaskService',
        function($scope, $modal, $dialog, $rootElement, $rootScope, $route, $filter, $timeout, $log, taskList, config, ContactService,
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

                $rootScope.$broadcast('ct-spinner-hide');
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

            $scope.dueToday = 0;
            $scope.dueThisWeek = 0;
            $scope.overdue = 0;
            $scope.taskList = taskList;
            $scope.taskListFiltered = [];
            $scope.taskListLimit = 5;
            $scope.taskListOngoing = [];
            $scope.taskListResolved = [];
            $scope.taskListResolvedLoaded = false;

            $scope.dpOpened = {
                filterDates: {}
            }

            $scope.isCollapsed = {
                filterAdvanced: true,
                filterDates: true,
                taskListResolved: true
            };

            $scope.filterParams = {
                contactId: null,
                userRole: {
                    field: null,
                    isEqual: null
                },
                dateRange: {
                    from: null,
                    until: null
                },
                due: null,
                assignmentType: []
            };

            $scope.filterParamsHolder = {
                dateRange: {
                    from: new Date().setHours(0, 0, 0, 0),
                    until: moment().add(1, 'month').toDate().setHours(0, 0, 0, 0)
                }
            }

            $scope.label = {
                overdue: 'Overdue',
                dueToday: 'Due Today',
                dueThisWeek: 'Due This Week',
                dateRange: ''
            };

            $scope.changeStatus = function(task, statusId){
                $scope.$broadcast('ct-spinner-show','task'+task.id);

                TaskService.save({
                    id: task.id,
                    status_id: statusId || '2'
                }).then(function(results){
                    task.status_id = results.status_id;
                    $scope.$broadcast('ct-spinner-hide','task'+task.id);
                })
            };

            $scope.labelDateRange = function(from, until){
                var filterDateTimeFrom = $filter('date')(from, 'dd/MM/yyyy') || '',
                    filterDateTimeUntil = $filter('date')(until, 'dd/MM/yyyy') || '';

                if (filterDateTimeUntil) {
                    filterDateTimeUntil = !filterDateTimeFrom ? 'Until: ' + filterDateTimeUntil : ' - ' + filterDateTimeUntil;
                }

                if (filterDateTimeFrom) {
                    filterDateTimeFrom = !filterDateTimeUntil ? 'From: ' + filterDateTimeFrom : filterDateTimeFrom;
                }

                $scope.label.dateRange = filterDateTimeFrom + filterDateTimeUntil;
            };

            $scope.loadTasksResolved = function(){

                if ($scope.taskListResolvedLoaded) {
                    return;
                }

                //Remove resolved tasks from the task list
                $scope.taskList = $scope.taskListOngoing;

                TaskService.get({
                    'target_contact_id': config.CONTACT_ID,
                    'status_id': {
                        'IN': config.status.resolve.TASK
                    }
                }).then(function(taskListResolved){
                    $scope.taskList.push.apply($scope.taskList, taskListResolved);
                    $timeout(function () {
                        $scope.taskListResolvedLoaded = true;
                    });
                });
            };

            $scope.deleteTask = function(task){

                $dialog.open({
                    msg: 'Are you sure you want to delete this task?'
                }).then(function(confirm){
                    if (!confirm) {
                        return
                    }

                    TaskService.delete(task.id).then(function(results){
                        $scope.taskList.splice($scope.taskList.indexOf(task),1);
                    });
                });

            };

            $scope.$on('assignmentFormSuccess',function(e, output){
                Array.prototype.push.apply($scope.taskList, output.taskList);
            });

            $scope.$on('taskFormSuccess',function(e, output, input){
                angular.equals({}, input) ? $scope.taskList.push(output) : angular.extend(input,output);
            });

            $scope.$on('crmFormSuccess',function(e, data){
                if (data.status == 'success')  {
                    var pattern = /case|activity|assignment/i;

                    if (pattern.test(data.title) ||
                        data.crmMessages.length &&
                        (pattern.test(data.crmMessages[0].title) ||
                        pattern.test(data.crmMessages[0].text))) {
                        $rootScope.cache.assignment = {
                            obj: {},
                            arr: []
                        };
                        $route.reload();
                    }
                }
            });

            this.init();

        }]);
});