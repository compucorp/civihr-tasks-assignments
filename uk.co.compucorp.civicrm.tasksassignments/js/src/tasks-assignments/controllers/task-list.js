define([
    'common/moment',
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/services/contact',
    'tasks-assignments/services/dialog',
    'tasks-assignments/services/task',
    'tasks-assignments/services/assignment'
], function (moment, controllers){
    'use strict';

    controllers.controller('TaskListCtrl',['$scope', '$modal', '$dialog', '$rootElement', '$rootScope', '$filter',
        '$timeout', '$state', '$log', 'taskList', 'config', 'ContactService', 'AssignmentService', 'TaskService', 'settings', 'HR_settings',
        function ($scope, $modal, $dialog, $rootElement, $rootScope, $filter, $timeout, $state, $log, taskList,
                 config, ContactService, AssignmentService, TaskService, settings, HR_settings) {
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

                if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
                    AssignmentService.get({'IN': assignmentIds}).then(function(data){
                        AssignmentService.updateCache(data);
                    });
                }

                $rootScope.$broadcast('ct-spinner-hide');
                $log.info($rootScope.cache);
            };

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
            };

            $scope.format = HR_settings.DATE_FORMAT;
            $scope.assignments = [];
            $scope.contacts = [];
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
            };

            $scope.isCollapsed = {
                filterAdvanced: true,
                filterDates: true,
                taskListResolved: true
            };

            $scope.filterParams = {
                contactId: null,
                userRole: $state.params.userRole || {
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
            };

            $scope.label = {
                overdue: 'Overdue',
                dueToday: 'Due Today',
                dueThisWeek: 'Due This Week',
                dateRange: 'Due Tasks'
            };

            $scope.cacheAssignment = function($item){

                if ($rootScope.cache.assignment.obj[$item.id]) {
                    return
                }

                var obj = {};

                obj[$item.id] = {
                    case_type_id: $filter('filter')($rootScope.cache.assignmentType.arr, { title: $item.extra.case_type })[0].id,
                    client_id: {
                        '1': $item.extra.contact_id
                    },
                    contact_id: {
                        '1': $item.extra.contact_id
                    },
                    contacts: [
                        {
                            sort_name: $item.extra.sort_name,
                            contact_id: $item.extra.contact_id
                        }
                    ],
                    end_date: $item.extra.end_date,
                    id: $item.id,
                    is_deleted: $item.label_class == 'strikethrough' ? '1' : '0',
                    start_date: $item.extra.start_date,
                    subject: $item.extra.case_subject
                };

                AssignmentService.updateCache(obj);
            };

            $scope.cacheContact = function($item){
                var obj = {};

                obj[$item.id] = {
                    contact_id: $item.id,
                    contact_type: $item.icon_class,
                    sort_name: $item.label,
                    display_name: $item.label,
                    email: $item.description.length ? $item.description[0] : ''
                };

                ContactService.updateCache(obj);
            };

            $scope.changeStatus = function(task, statusId){
                $scope.$broadcast('ct-spinner-show','task'+task.id);

                TaskService.save({
                    id: task.id,
                    status_id: statusId || '2'
                }).then(function(results){
                    $rootScope.$broadcast('taskFormSuccess', results, task);
                    $scope.$broadcast('ct-spinner-hide','task'+task.id);
                    AssignmentService.updateTab();
                })
            };

            $scope.updateTask = function(task, updateObj) {

                var updatePromise = TaskService.save(angular.extend({
                    id: task.id
                },updateObj));

                updatePromise.then(null,function(reason){
                    CRM.alert(reason, 'Error', 'error');
                });

                return updatePromise;
            };

            $scope.updateAssignments = function(assignments, targetContactId){
                $scope.assignments = $filter('filter')(assignments, function(val){
                    return +val.extra.contact_id == +targetContactId;
                });
            };

            $scope.updateContacts = function(contacts){
                $scope.contacts = contacts;
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

            $scope.refreshAssignments = function(input, targetContactId, caseId){

                if (!input || !targetContactId || !caseId) {
                    return
                }

                AssignmentService.search(input, caseId).then(function(results){
                    $scope.assignments = $filter('filter')(results, function(val){
                        return +val.extra.contact_id == +targetContactId;
                    });
                });
            };

            $scope.loadTasksResolved = function(){

                if ($scope.taskListResolvedLoaded) {
                    return;
                }

                var ctrl = this;

                //Remove resolved tasks from the task list
                $filter('filterByStatus')($scope.taskList, $rootScope.cache.taskStatusResolve, false);

                TaskService.get({
                    'target_contact_id': config.CONTACT_ID,
                    'status_id': {
                        'IN': config.status.resolve.TASK
                    }
                }).then(function(taskListResolved){
                    var contactIds = ctrl.contactIds,
                        assignmentIds = ctrl.assignmentIds;

                    ctrl.collectId(taskListResolved);

                    if (contactIds && contactIds.length) {
                        ContactService.get({'IN': contactIds}).then(function(data){
                            ContactService.updateCache(data);
                        });
                    }

                    if (assignmentIds && assignmentIds.length && settings.extEnabled.assignments) {
                        AssignmentService.get({'IN': assignmentIds}).then(function(data){
                            AssignmentService.updateCache(data);
                        });
                    }

                    Array.prototype.push.apply($scope.taskList, taskListResolved);

                    $scope.taskListResolvedLoaded = true;
                });
            }.bind(this);

            $scope.deleteTask = function(task){

                $dialog.open({
                    msg: 'Are you sure you want to delete this task?'
                }).then(function(confirm){
                    if (!confirm) {
                        return
                    }

                    TaskService.delete(task.id).then(function(results){
                        $scope.taskList.splice($scope.taskList.indexOf(task),1);

                        $rootScope.$broadcast('taskDelete', task.id);
                        AssignmentService.updateTab();
                    });
                });

            };

            $scope.viewInCalendar = function(view){
                $state.go('calendar.mwl.'+view);
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
                        (data.crmMessages && data.crmMessages.length) &&
                        (pattern.test(data.crmMessages[0].title) ||
                        pattern.test(data.crmMessages[0].text))) {
                        $rootScope.cache.assignment = {
                            obj: {},
                            arr: []
                        };

                        $state.go($state.current, {}, {reload: true});
                    }
                }
            });

            this.init();

        }]);
});
