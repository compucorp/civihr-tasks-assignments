define(['controllers/controllers',
        'services/contact',
        'services/document',
        'services/task',
        'services/assignment'], function(controllers){
    controllers.controller('ModalAssignmentCtrl',['$scope', '$modalInstance', '$rootScope', '$q', '$log', '$filter',
         'AssignmentService', 'TaskService', 'DocumentService', 'ContactService', 'data', 'config',
        function($scope, $modalInstance, $rootScope, $q, $log, $filter, AssignmentService, TaskService, DocumentService,
                 ContactService, data, config){
            $log.debug('Controller: ModalAssignmentCtrl');

            var activityModel = {
                    activity_type_id: null,
                    assignee_contact_id: [],
                    case_id: null,
                    create: true,
                    isAdded: false,
                    name: null,
                    source_contact_id: config.LOGGED_IN_CONTACT_ID,
                    status_id: '1'
                };

            $scope.assignment = {};
            $scope.assignment.status_id = '1';
            $scope.assignment.contact_id = config.CONTACT_ID;
            $scope.assignment.client_id = $scope.assignment.contact_id;
            $scope.assignment.subject = '';

            $scope.contacts = $rootScope.cache.contact.arrSearch;
            $scope.dpOpened = {};
            $scope.showCId = !config.CONTACT_ID;
            $scope.activitySet = {};
            $scope.taskList = [];
            $scope.documentList = [];

            $scope.addActivity = function(activityArr){

                if (!activityArr) {
                    return
                }

                activityArr.push(angular.extend({},activityModel,{isAdded: true}));

            }

            $scope.removeActivity = function(activityArr, index){

                if (!activityArr) {
                    return
                }

                activityArr.splice(index, 1);
            };

            $scope.dpOpen = function($event, key){
                $event.preventDefault();
                $event.stopPropagation();

                $scope.dpOpened[key] = true;

            }

            $scope.refreshContacts = function(input){
                if (!input) {
                    return
                }

                ContactService.search(input, {
                    contact_type: 'Individual'
                }).then(function(results){
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

                if (!assignmentType) {
                    $scope.activitySet = {};
                    $scope.assignment.subject = '';

                    return;
                }

                $scope.activitySet = assignmentType.definition.activitySets[0];
                $scope.assignment.subject = $rootScope.cache.assignmentType.obj[$scope.assignment.case_type_id].title;
            }

            $scope.cancel = function(){
                $modalInstance.dismiss('cancel');
            }

            $scope.confirm = function(){
                $scope.$broadcast('ct-spinner-show');

                var documentListAssignment = [], taskListAssignment = [], taskArr = [], documentArr = [],
                    cacheAssignmentObj = {}, i, len;

                $scope.assignment.start_date = new Date();

                AssignmentService.save($scope.assignment).then(function(resultAssignment) {

                    angular.forEach($scope.taskList, function (task) {
                        if (task.create) {
                            task.case_id = resultAssignment.id;
                            this.push(task);
                        }
                    }, taskListAssignment);

                    angular.forEach($scope.documentList, function (document) {
                        if (document.create) {
                            document.case_id = resultAssignment.id;
                            this.push(document);
                        }
                    }, documentListAssignment);

                    $q.all({
                        task: TaskService.saveMultiple(taskListAssignment),
                        document: DocumentService.saveMultiple(documentListAssignment)
                    }).then(function (results) {

                        i = 0, len = results.task.length;
                        for (i; i < len; i++) {
                            taskListAssignment[i].id = results.task[i].id;
                            taskArr.push(results.task[i].id);
                        }

                        i = 0, len = results.document.length;
                        for (i; i < len; i++) {
                            documentListAssignment[i].id = results.document[i].id;
                            documentArr.push(results.document[i].id);
                        }

                        return $q.all({
                            assignedTasks: TaskService.assign(taskArr, resultAssignment.id),
                            assignedDocuments: DocumentService.assign(documentArr, resultAssignment.id),
                            relationship: AssignmentService.assignCoordinator($scope.assignment.contact_id, resultAssignment.id)
                        });

                    }, function (reason) {
                        CRM.alert(reason, 'Error', 'error');
                        $modalInstance.dismiss();
                        $scope.$broadcast('ct-spinner-hide');
                        return $q.reject();
                    }).then(function(results) {

                        i = 0, len = results.assignedTasks.length;
                        for (i; i < len; i++) {
                            taskArr.push(results.assignedTasks[i].id)
                        }

                        i = 0, len = results.assignedDocuments.length;
                        for (i; i < len; i++) {
                            documentArr.push(results.assignedDocuments[i].id)
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
                            activities: taskArr.concat(documentArr)
                        });

                        AssignmentService.updateCache(cacheAssignmentObj);
                        AssignmentService.updateTab(1);
                        $modalInstance.close({
                            documentList: documentListAssignment,
                            taskList: taskListAssignment
                        });
                        $scope.$broadcast('ct-spinner-hide');
                        return
                    }, function (reason) {
                        CRM.alert(reason, 'Error', 'error');
                        $modalInstance.dismiss();
                        $scope.$broadcast('ct-spinner-hide');
                        return $q.reject();
                    });

                }, function (reason) {
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    $scope.$broadcast('ct-spinner-hide');
                    return $q.reject();
                });

            }

            $scope.$watch('activitySet',function(activitySet){

                if (!activitySet.activityTypes) {
                    return
                }

                var activity,
                    activityTypes = activitySet.activityTypes,
                    activityTypesLen = activityTypes.length,
                    documentList = [],
                    documentType,
                    taskList = [],
                    taskType,
                    i = 0;

                for (; i < activityTypesLen; i++) {
                    activity = angular.copy(activityModel);
                    activity.name = activityTypes[i].name;

                    documentType = activity.name ? $filter('filter')($rootScope.cache.documentType.arr, { value: activity.name }, true)[0] : '';

                    if (documentType) {
                        activity.activity_type_id = documentType.key;
                        documentList.push(activity);
                        continue;
                    }

                    taskType = activity.name ? $filter('filter')($rootScope.cache.taskType.arr, { value: activity.name }, true)[0] : '';
                    activity.activity_type_id = taskType ? taskType.key : null;
                    taskList.push(activity);
                }

                angular.copy(taskList, $scope.taskList);
                angular.copy(documentList, $scope.documentList);
            });

        }]);

    controllers.controller('ModalAssignmentActivityCtrl',['$scope', '$log',
        function($scope, $log){
            $log.debug('Controller: ModalAssignmentTaskCtrl');

            $scope.isDisabled = !$scope.activity.activity_type_id && !$scope.activity.isAdded;
            $scope.activity.create = !$scope.isDisabled;

            if ($scope.isDisabled) {
                return
            }

            $scope.$watch('$parent.assignment.contact_id',function(targetContactId){

                if (!targetContactId) {
                    return
                }

                $scope.activity.target_contact_id = [targetContactId];
            });

            $scope.$watch('$parent.assignment.dueDate',function(assignmentDueDate){

                if (!$scope.activity.create) {
                    return
                }

                if (!$scope.activity.activity_date_time || $scope.activity.activity_date_time > assignmentDueDate) {
                    $scope.activity.activity_date_time = assignmentDueDate;
                }
            });

        }]);
});