/* eslint-env amd */

define([
  'common/angular',
  'common/moment'
], function (angular, moment) {
  'use strict';

  ModalTaskController.$inject = [
    '$filter', '$log', '$q', '$rootScope', '$scope', '$timeout', '$uibModal',
    '$uibModalInstance', '$dialog', 'crmAngService', 'assignmentService', 'contactService',
    'taskService', 'HR_settings', 'data', 'config'
  ];

  function ModalTaskController ($filter, $log, $q, $rootScope, $scope, $timeout,
    $modal, $modalInstance, $dialog, crmAngService, assignmentService, contactService,
    taskService, hrSettings, data, config) {
    $log.debug('Controller: ModalTaskController');

    $scope.assignments = [];
    $scope.format = hrSettings.DATE_FORMAT.toLowerCase();
    $scope.data = data;
    $scope.showCId = !config.CONTACT_ID;
    $scope.showFieldAssignment = false;
    $scope.task = {};

    angular.copy(data, $scope.task);

    $scope.modalTitle = $scope.task.id ? 'Edit Task' : 'New Task';
    $scope.task.activity_date_time = $scope.task.activity_date_time || moment().toDate();
    $scope.task.assignee_contact_id = $scope.task.assignee_contact_id || [];
    $scope.task.source_contact_id = $scope.task.source_contact_id || config.LOGGED_IN_CONTACT_ID;
    $scope.task.target_contact_id = $scope.task.target_contact_id || [config.CONTACT_ID];
    $scope.contacts = {
      target: initialContacts('target'),
      assignee: initialContacts('assignee')
    };

    $scope.cacheAssignment = cacheAssignment;
    $scope.cacheContact = cacheContact;
    $scope.cancel = cancel;
    $scope.confirm = confirm;
    $scope.dpOpen = dpOpen;
    $scope.refreshContacts = refreshContacts;
    $scope.task.openActivityTypeOptionsEditor = openActivityTypeOptionsEditor;

    (function init () {
      initWatchers();

      $scope.task.id && loadContactAssignments($scope.task.target_contact_id);
    })();

    function cacheAssignment ($item) {
      if ($rootScope.cache.assignment.obj[$item.id]) {
        return;
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
        is_deleted: $item.label_class === 'strikethrough' ? '1' : '0',
        start_date: $item.extra.start_date,
        subject: $item.extra.case_subject
      };

      assignmentService.updateCache(obj);
    }

    function cacheContact ($item) {
      var obj = {};

      obj[$item.id] = {
        contact_id: $item.id,
        contact_type: $item.icon_class,
        sort_name: $item.label,
        display_name: $item.label,
        email: $item.description.length ? $item.description[0] : ''
      };

      contactService.updateCache(obj);
    }

    function cancel () {
      if ($scope.taskForm.$pristine) {
        $modalInstance.dismiss('cancel');
        return;
      }

      $dialog.open({
        copyCancel: 'No',
        msg: 'Are you sure you want to cancel? Changes will be lost!'
      }).then(function (confirm) {
        if (!confirm) {
          return;
        }

        $scope.$broadcast('ct-spinner-hide');
        $modalInstance.dismiss('cancel');
      });
    }

    function confirm () {
      var task = angular.copy($scope.task);

      if (!validateRequiredFields(task)) {
        return;
      }

      if (angular.equals(data, task)) {
        $modalInstance.dismiss('cancel');
        return;
      }

      $scope.$broadcast('ct-spinner-show');

      // temporary remove case_id
      +task.case_id === +data.case_id && delete task.case_id;
      task.activity_date_time = task.activity_date_time || new Date();

      taskService.save(task).then(function (results) {
        $scope.task.id = results.id;
        $scope.task.case_id = results.case_id;

        assignmentService.updateTab();

        if ($scope.openNew) {
          $scope.task.open = true;
          $scope.openNew = false;
        }

        $modalInstance.close($scope.task);
        $scope.$broadcast('ct-spinner-hide');
      }, function (reason) {
        CRM.alert(reason, 'Error', 'error');
        $scope.$broadcast('ct-spinner-hide');
        return $q.reject();
      });
    }

    function dpOpen ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.dpOpened = true;
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
    function initialContacts (type) {
      var cachedContacts = $rootScope.cache.contact.arrSearch;

      return !$scope.task.id ? [] : cachedContacts.filter(function (contact) {
        var currContactId = $scope.task[type + '_contact_id'][0];

        return +currContactId === +contact.id;
      });
    }

    /**
     * Initializes the watchers on scope's properties
     */
    function initWatchers () {
      $scope.$watch('task.target_contact_id', function (contactId, old) {
        if (contactId === old) {
          return;
        }

        $scope.task.case_id = null;
        $scope.showFieldAssignment = false;

        loadContactAssignments(contactId);
      }, true);
    }

    /**
     * Fetches the assignments assigned to the contact with the given id
     *
     * @param  {string} contactId
     */
    function loadContactAssignments (contactId) {
      $scope.assignments = [];

      if (!contactId[0]) {
        return;
      }

      $timeout(function () { $scope.$broadcast('ct-spinner-show'); }, 0);

      assignmentService.search(null, null, contactId)
        .then(function (results) {
          $scope.assignments = results;
          $scope.$broadcast('ct-spinner-hide');
        });
    }

    function refreshContacts (input, type) {
      if (!input) {
        return;
      }

      contactService.search(input, {
        contact_type: 'Individual'
      }).then(function (results) {
        $scope.contacts[type] = results;
      });
    }

    /**
     * Validates if the required fields values are present, and shows a notification if needed
     * @param  {Object} task The task to validate
     * @return {boolean}     Whether the required field values are present
     */
    function validateRequiredFields (task) {
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

      if (missingRequiredFields.length) {
        var notification = CRM.alert(missingRequiredFields.join(', '),
          missingRequiredFields.length === 1 ? 'Required field' : 'Required fields', 'error');
        $timeout(function () {
          notification.close();
          notification = null;
        }, 5000);
        return false;
      }

      return true;
    }

    /**
     * Opens editor for activity type options editing
     */
    function openActivityTypeOptionsEditor () {
      crmAngService.loadForm('/civicrm/admin/options/activity_type?reset=1')
        .on('crmUnload', function () {
          taskService.getOptions()
            .then(function (options) {
              angular.extend($rootScope.cache, options);
            });
        });
    }
  }

  return { ModalTaskController: ModalTaskController };
});
