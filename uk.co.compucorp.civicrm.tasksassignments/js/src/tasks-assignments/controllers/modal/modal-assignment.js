define([
  'common/lodash',
  'common/angular',
  'common/moment',
  'tasks-assignments/controllers/controllers',
  'tasks-assignments/services/contact',
  'tasks-assignments/services/document',
  'tasks-assignments/services/task',
  'tasks-assignments/services/assignment'
], function (_, angular, moment, controllers) {
    'use strict';

    controllers.controller('ModalAssignmentCtrl', ['$timeout', '$scope', '$uibModalInstance', '$rootScope', '$q', '$log', '$filter',
        'AssignmentService', 'TaskService', 'DocumentService', 'ContactService', 'data', 'config', 'settings', 'HR_settings',
        function ($timeout, $scope, $modalInstance, $rootScope, $q, $log, $filter, AssignmentService, TaskService, DocumentService,
                  ContactService, data, config, settings, HR_settings) {
            $log.debug('Controller: ModalAssignmentCtrl');

            var activityModel = {
                activity_type_id: null,
                assignee_contact_id: [],
                case_id: null,
                create: true,
                isAdded: false,
                name: null,
                source_contact_id: config.LOGGED_IN_CONTACT_ID,
                status_id: '1',
                offset: 0
            };

            $scope.format = HR_settings.DATE_FORMAT.toLowerCase();
            $scope.copyMessage = 'Click here to copy the value in row one to all rows.';

            $scope.alert = {
                show: false,
                msg: '',
                type: 'danger'
            };

            $scope.assignment = {};
            $scope.assignment.status_id = '1';
            $scope.assignment.contact_id = config.CONTACT_ID;
            $scope.assignment.client_id = $scope.assignment.contact_id;
            $scope.assignment.subject = '';
            $scope.assignment.dueDate = null;

            $scope.dpOpened = {};
            $scope.showCId = !config.CONTACT_ID;
            $scope.activitySet = {};
            $scope.taskList = [];
            $scope.documentList = [];

            // The contacts collections used by the lookup directives
            // divided by type
            $scope.contacts = {
                target: [],
                document: [],
                task: []
            };

            /**
             * Update activitySet with the current timeline
             *
             * @param  {object} item Timeline item
             */
            $scope.updateTimeline = function(item) {
              $scope.activitySet = item;
            };

            $scope.addActivity = function (activityArr) {

                if (!activityArr) {
                    return
                }

                activityArr.push(angular.extend(angular.copy(activityModel), { isAdded: true }));
            };

            $scope.removeActivity = function (activityArr, index) {

                if (!activityArr) {
                    return
                }

                activityArr.splice(index, 1);
            };

            $scope.dpOpen = function ($event, key) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.dpOpened[key] = true;
            };

            /**
             * Fetches and stores a list of contacts based on the given
             * query string
             *
             * @param {string} input
             *   The search query the user typed
             * @param {string} type
             *   The type of contacts collection that the contacts will be stored
             *   into (target, task, or document)
             * @param {int} index
             *   When fetching contacts for either the task or documents collection
             *   the list will be stored as a sub-collection (at the given index)
             *   so that each task or document has a separate contacts list
             */
            $scope.refreshContacts = function (input, type, index) {
                if (!input) {
                    return;
                }

                ContactService.search(input, {
                    contact_type: 'Individual'
                }).then(function (results) {
                    if (type === 'target') {
                        $scope.contacts[type] = results;
                    } else {
                        $scope.contacts[type][index] = results;
                    }
                });
            };

            $scope.cacheContact = function ($item) {
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

            $scope.setData = function () {

                var assignmentType = $rootScope.cache.assignmentType.obj[$scope.assignment.case_type_id];

                if (!assignmentType) {
                    $scope.activitySet = {};
                    $scope.assignment.subject = '';

                    return;
                }

                $scope.activitySet = assignmentType.definition.activitySets[0];
                $scope.assignment.subject = $rootScope.cache.assignmentType.obj[$scope.assignment.case_type_id].title;

                $scope.assignment.dueDate = $scope.assignment.dueDate || new Date(new Date().setHours(0, 0, 0, 0));
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.confirm = function () {
              if (
                !($filter('filter')($scope.taskList, { create: true })).length &&
                !($filter('filter')($scope.documentList, { create: true })).length
              ) {
                $scope.alert.msg = 'Please add at least one task.';
                $scope.alert.show = true;
                return;
              }

              if (!validateRequiredFields($scope.assignment)) {
                return;
              }

              $scope.$broadcast('ct-spinner-show');
              $scope.assignment.start_date = new Date();

              AssignmentService.save($scope.assignment).then(function (resultAssignment) {
                var documentListAssignment = $scope.documentList.filter(function (doc) {
                  return doc.create;
                })
                .map(function (doc) {
                  doc.case_id = resultAssignment.id;
                  return doc;
                });

                var taskListAssignment = $scope.taskList.filter(function (task) {
                  return task.create;
                })
                .map(function (task) {
                  task.case_id = resultAssignment.id;
                  return task;
                });

                $q.all({
                  relationship: AssignmentService.assignCoordinator($scope.assignment.contact_id, resultAssignment.id),
                  document: DocumentService.saveMultiple(documentListAssignment.map(function (doc) {
                    return angular.copy(doc);
                  })),
                  task: TaskService.saveMultiple(taskListAssignment.map(function (task) {
                    return angular.copy(task);
                  }))
                })
                .then(function (results) {
                  var i, taskArr = [], documentArr = [], cacheAssignmentObj = {};

                  for (i = 0; i < results.task.length; i++) {
                    taskListAssignment[i].id = results.task[i].id;
                    taskArr.push(results.task[i].id);
                  }

                  for (i = 0; i < results.document.length; i++) {
                    documentListAssignment[i].id = results.document[i].id;
                    documentArr.push(results.document[i].id);
                  }

                  cacheAssignmentObj[resultAssignment.id] = angular.extend(angular.copy($scope.assignment), {
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
                }, function (reason) {
                  CRM.alert(reason, 'Error', 'error');
                  $scope.$broadcast('ct-spinner-hide');
                  return $q.reject();
                });
              }, function (reason) {
                CRM.alert(reason, 'Error', 'error');
                $scope.$broadcast('ct-spinner-hide');
                return $q.reject();
              });
            };

            /**
             * Copy assignee id and contacts collection from the first
             * enabled item of the list to the rest of the items
             *
             * @param {Array} list
             * @param {string} type (document, task)
             */
            $scope.copyAssignee = function copyAssignee(list, type) {
              var firstEnabled = firstEnabledItem(list);

              list.forEach(function (item, index) {
                var firstEnabledContacts = $scope.contacts[type][_.indexOf(list, firstEnabled)] || [],
                  firstEnabledAssignee = firstEnabled.assignee_contact_id ? [firstEnabled.assignee_contact_id[0]] : firstEnabled.assignee_contact_id;

                if (item.create) {
                  $scope.contacts[type][index] = firstEnabledContacts.slice();
                  item.assignee_contact_id = firstEnabledAssignee;
                }
              });
            };

            /**
             * Copy date from the first enabled item of the list
             * to the rest of the items
             *
             * @param {Array} list
             */
            $scope.copyDate = function copyDate(list) {
              list.forEach(function (item) {
                if (item.create) {
                  item.activity_date_time = firstEnabledItem(list).activity_date_time;
                }
              });
            };

            $scope.$watch('activitySet', function (activitySet) {

                if (!activitySet.activityTypes) {
                  $scope.taskList = [];
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
                    activity.offset = activityTypes[i].reference_offset;

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

                if (!+settings.tabEnabled.documents) {
                    return
                }

                angular.copy(documentList, $scope.documentList);
            });

            /**
             * Returns the first enable item in the given collection
             *
             * @param  {Array} collection
             * @return {Object}
             */
            function firstEnabledItem(collection) {
              return _.find(collection, function (item) {
                return item.create;
              });
            }

            /**
             * Validates if the required fields values are present
             * and shows a notification if needed
             *
             * @param  {Object} assignment The assignment to validate
             * @return {boolean}     Whether the required field values are present
             */
            function validateRequiredFields(assignment) {
              var missingRequiredFields = [];

              !assignment.contact_id   && missingRequiredFields.push('Target Contact');
              !assignment.case_type_id && missingRequiredFields.push('Assignment type');
              !assignment.dueDate      && missingRequiredFields.push('Key date');

              $scope.taskList.filter(function (task) {
                return task.create;
              })
              .forEach(function (task) {
                if (!_.includes(missingRequiredFields, 'Activity type')) {
                  !task.activity_type_id && missingRequiredFields.push('Activity type');
                }

                if (!_.includes(missingRequiredFields, 'Activity Due Date')) {
                  !task.activity_date_time && missingRequiredFields.push('Activity Due Date');
                }
              });

              if (missingRequiredFields.length) {
                var notification = CRM.alert(missingRequiredFields.join(', '),
                  missingRequiredFields.length === 1 ? 'Required field' : 'Required fields', 'error');

                $timeout(function(){
                  notification.close();
                  notification = null;
                }, 5000);

                return false;
              }

              return true;
            }
        }
    ]);

    controllers.controller('ModalAssignmentActivityCtrl', ['$scope', '$log',
      function ($scope, $log) {
        $log.debug('Controller: ModalAssignmentTaskCtrl');

        $scope.isDisabled = !$scope.activity.activity_type_id && !$scope.activity.isAdded;
        $scope.activity.create = !$scope.isDisabled;

        $scope.$watch('$parent.assignment.dueDate', function (assignmentDueDate) {
          if ($scope.activity.create) {
            $scope.activity.activity_date_time = !!assignmentDueDate ? moment(assignmentDueDate).add($scope.activity.offset, 'days').toDate() : null;
          }
        });

        $scope.$watch('$parent.assignment.contact_id', function (targetContactId) {
          if (targetContactId && $scope.activity.create) {
            $scope.activity.target_contact_id = [targetContactId];
          }
        });
      }
    ]);
});
