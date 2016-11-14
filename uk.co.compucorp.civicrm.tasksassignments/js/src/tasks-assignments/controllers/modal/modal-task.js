define([
    'common/angular',
    'common/moment',
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/services/contact',
    'tasks-assignments/services/dialog',
    'tasks-assignments/services/task'
], function (angular, moment, controllers) {
    'use strict';

    controllers.controller('ModalTaskCtrl', ['$timeout', '$scope', '$uibModalInstance', '$rootScope', '$rootElement', '$q', '$log', '$filter',
        '$uibModal', '$dialog', 'AssignmentService', 'TaskService', 'ContactService', 'data', 'config', 'HR_settings',
        function ($timeout, $scope, $modalInstance, $rootScope, $rootElement, $q, $log, $filter, $modal, $dialog, AssignmentService, TaskService, ContactService,
                  data, config, HR_settings) {
            $log.debug('Controller: ModalTaskCtrl');

            $scope.format = HR_settings.DATE_FORMAT.toLowerCase();
            $scope.data = data;
            $scope.task = {};

            angular.copy(data, $scope.task);

            $scope.task.activity_date_time = $scope.task.activity_date_time || moment().toDate();
            $scope.task.assignee_contact_id = $scope.task.assignee_contact_id || [];
            $scope.task.source_contact_id = $scope.task.source_contact_id || config.LOGGED_IN_CONTACT_ID;
            $scope.task.target_contact_id = $scope.task.target_contact_id || [config.CONTACT_ID];
            $scope.showCId = !config.CONTACT_ID;

            $scope.assignments = initialAssignments();
            $scope.contacts = {
                target: initialContacts('target'),
                assignee: initialContacts('assignee')
            };

            $scope.cacheAssignment = function ($item) {

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

            $scope.refreshAssignments = function (input) {

                if (!input) {
                    return
                }

                var targetContactId = $scope.task.target_contact_id;

                AssignmentService.search(input, $scope.task.case_id).then(function (results) {
                    $scope.assignments = $filter('filter')(results, function (val) {
                        return +val.extra.contact_id == +targetContactId;
                    });
                });
            };

            $scope.refreshContacts = function (input, type) {
                if (!input) {
                    return
                }

                ContactService.search(input, {
                    contact_type: 'Individual'
                }).then(function (results) {
                    $scope.contacts[type] = results;
                });
            };

            $scope.dpOpen = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.dpOpened = true;

            };

            $scope.cancel = function () {

                if ($scope.taskForm.$pristine) {
                    $modalInstance.dismiss('cancel');
                    return
                }

                $dialog.open({
                    copyCancel: 'No',
                    msg: 'Are you sure you want to cancel? Changes will be lost!'
                }).then(function (confirm) {
                    if (!confirm) {
                        return
                    }

                    $scope.$broadcast('ct-spinner-hide');
                    $modalInstance.dismiss('cancel');
                });

            };

            $scope.confirm = function () {
              var task = angular.copy($scope.task);

              if (!validateRequiredFields(task)) {
                return;
              }

              if (angular.equals(data, task)) {
                  $modalInstance.dismiss('cancel');
                  return;
              }

              $scope.$broadcast('ct-spinner-show');

              //temporary remove case_id
              +task.case_id == +data.case_id && delete task.case_id;
              task.activity_date_time = task.activity_date_time || new Date();

              TaskService.save(task).then(function (results) {
                $scope.task.id = results.id;
                $scope.task.case_id = results.case_id;

                AssignmentService.updateTab();

                if ($scope.openNew) {
                    $scope.task.open = true;
                    $scope.openNew = false;
                }

                $modalInstance.close($scope.task);
                $scope.$broadcast('ct-spinner-hide');

                return;
              }, function (reason) {
                CRM.alert(reason, 'Error', 'error');
                $scope.$broadcast('ct-spinner-hide');
                return $q.reject();
              });
            };

            /**
             * Validates if the required fields values are present, and shows a notification if needed
             * @param  {Object} task The task to validate
             * @return {boolean}     Whether the required field values are present
             */
            function validateRequiredFields(task) {
              var missingRequiredFields = [];

              if (!task.target_contact_id[0]) {
                missingRequiredFields.push('Task Target');
              }

              if (!task.activity_type_id) {
                missingRequiredFields.push('Task type');
              }

              if (!task.activity_date_time) {
                missingRequiredFields.push('Due date');
              }

              if (!task.assignee_contact_id[0]) {
                missingRequiredFields.push('Assignee');
              }

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

            /**
             * The initial assignments that needs to be immediately available
             * in the lookup directive
             *
             * @return {Array}
             */
            function initialAssignments() {
                var cachedAssignments = $rootScope.cache.assignment.arrSearch;

                return cachedAssignments.filter(function (assignment) {
                    return +assignment.extra.contact_id === +$scope.task.target_contact_id;
                });
            }

            /**
             * The initial contacts that needs to be immediately available
             * in the lookup directive for the given type
             *
             * If the modal is for a branch new task, then the contacts list is empty
             *
             * @param {string} type - Either 'assignee' or 'target'
             * @return {Array}
             */
            function initialContacts(type) {
                var cachedContacts = $rootScope.cache.contact.arrSearch;

                return !$scope.task.id ? [] : cachedContacts.filter(function (contact) {
                    var currContactId = $scope.task[type + '_contact_id'][0];

                    return +currContactId === +contact.id;
                });
            }
        }]);
});
