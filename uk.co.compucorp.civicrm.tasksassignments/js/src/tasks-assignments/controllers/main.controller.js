/* eslint-env amd */

define([
  'common/lodash'
], function (_) {
  'use strict';

  MainController.$inject = [
    '$log', '$q', '$rootElement', '$rootScope',
    '$scope', '$uibModal', 'beforeHashQueryParams', 'config', 'fileServiceTA',
    'OptionGroup', 'Session', 'notificationService', 'taskService'
  ];

  function MainController ($log, $q, $rootElement,
    $rootScope, $scope, $modal, beforeHashQueryParams, config, fileServiceTA,
    OptionGroup, Session, notificationService, taskService) {
    var queryParams;

    $log.debug('Controller: MainController');

    $rootScope.modalAssignment = modalAssignment;
    $rootScope.modalDocument = modalDocument;
    $rootScope.modalReminder = modalReminder;
    $rootScope.modalTask = modalTask;

    (function init () {
      queryParams = beforeHashQueryParams.parse();

      queryParams.openModal && autoOpenModal(queryParams.openModal);
      initWatchers();
    }());

    /**
     * Automatically opens the modal of the given type
     *
     * @param {String} modalType
     */
    function autoOpenModal (modalType) {
      var method = $rootScope['modal' + _.capitalize(modalType)];

      if (typeof method === 'function') {
        method({ case_type_id: (queryParams.caseTypeId || null) });
      } else {
        $log.warn('There is no method available for opening the required ' + modalType + ' modal!');
      }
    }

    /**
     * Displays a case closed success message given the provided case and client
     * data.
     *
     * @param {String} caseTypeTitle - the case type title.
     * @param {String} clientDisplayName - the display name of the case client.
     */
    function displayCaseClosedSuccessMessage (caseTypeTitle, clientDisplayName) {
      var message = 'All tasks in the ' + caseTypeTitle + ' workflow for ' +
        clientDisplayName + ' have been completed. Good work!';

      notificationService.success('Success', message);
    }

    /**
     * Returns the parent's case title and status for the given child task id.
     *
     * @param  {Number}  taskId - the child task id.
     * @return {Promise} resolves to the parent case title and status.
     */
    function getCaseDataFromTask (taskId) {
      return taskService.get({
        id: taskId,
        return: [
          'case_id.case_type_id.title',
          'case_id.status_id.name'
        ]
      }).then(function (listOfTasks) {
        var task = listOfTasks[0];

        if (!task) {
          return;
        }

        return {
          caseTypeTitle: task['case_id.case_type_id.title'],
          statusName: task['case_id.status_id.name']
        };
      });
    }

    /**
     * Initializes the taskFormSuccess watcher.
     */
    function initWatchers () {
      $scope.$on('taskFormSuccess', function (event, localTaskData, task) {
        var clientData = $rootScope.cache.contact.obj[task.target_contact_id[0]];

        if (_.isEmpty(task.case_id)) {
          return;
        }

        getCaseDataFromTask(task.id)
          .then(function (caseData) {
            if (caseData.statusName !== 'Closed') {
              return;
            }

            displayCaseClosedSuccessMessage(caseData.caseTypeTitle, clientData.display_name);
          });
      });
    }

    /**
     * Opens the assignment modal
     *
     * @param {Object} data
     */
    function modalAssignment (data) {
      var modalInstance;

      data = data || {};
      modalInstance = $modal.open({
        appendTo: $rootElement.find('div').eq(0),
        templateUrl: config.path.EXT + 'js/src/tasks-assignments/controllers/modal/modal-assignment.html',
        controller: 'ModalAssignmentController',
        size: 'lg',
        resolve: {
          data: function () {
            return data;
          },
          session: function () {
            return Session.get();
          },
          defaultAssigneeOptions: function () {
            return OptionGroup.valuesOf('activity_default_assignee');
          }
        }
      });

      modalInstance.result.then(function (results) {
        $scope.$broadcast('assignmentFormSuccess', results, data);
      }, function () {
        $log.info('Modal dismissed');
      });
    }

    /**
     * Opens Document Modal based on passed modal mode, role and
     * list of attachments, document data to Document Modal
     *
     * @param {Object} data Document data
     * @param {String} modalMode Mode of the Modal, 'edit' or 'new'
     * @param {Object} e Triggered event
     */
    function modalDocument (data, modalMode, e) {
      var modalInstance;

      e && e.preventDefault();

      modalMode = modalMode || 'new';
      data = data || {};
      modalInstance = $modal.open({
        appendTo: $rootElement.find('div').eq(0),
        templateUrl: config.path.EXT + 'js/src/tasks-assignments/controllers/modal/modal-document.html',
        controller: 'ModalDocumentController',
        controllerAs: 'documentModal',
        resolve: {
          modalMode: function () {
            return modalMode;
          },
          role: function () {
            return 'admin';
          },
          data: function () {
            return data;
          },
          files: function () {
            if (!data.id || !+data.file_count) {
              return [];
            }

            return fileServiceTA.get(data.id, 'civicrm_activity');
          }
        }
      });

      modalInstance.result.then(function (results) {
        $scope.$broadcast('documentFormSuccess', results, data);
      }, function () {
        $log.info('Modal dismissed');
      });
    }

    /**
     * Opens the reminder modal
     *
     * @param {Object} data
     * @param {Object} type
     */
    function modalReminder (data, type) {
      if (!data || typeof data !== 'object' || !type || typeof type !== 'string') {
        return null;
      }

      $modal.open({
        appendTo: $rootElement.find('div').eq(0),
        templateUrl: config.path.EXT + 'js/src/tasks-assignments/controllers/modal/modal-reminder.html',
        controller: 'ModalReminderController',
        resolve: {
          data: function () {
            return data;
          },
          type: function () {
            return type;
          }
        }
      });
    }

    /**
     * Opens the task modal
     *
     * @param {Object} data
     */
    function modalTask (data) {
      var modalInstance;

      data = data || {};
      modalInstance = $modal.open({
        appendTo: $rootElement.find('div').eq(0),
        templateUrl: config.path.EXT + 'js/src/tasks-assignments/controllers/modal/modal-task.html',
        controller: 'ModalTaskController',
        resolve: {
          data: function () {
            return data;
          }
        }
      });

      modalInstance.result.then(function (results) {
        $scope.$broadcast('taskFormSuccess', results, data);

        if (results.open) {
          $rootScope.modalTask(data);
        }
      }, function () {
        $log.info('Modal dismissed');
      });
    }
  }

  return { MainController: MainController };
});
