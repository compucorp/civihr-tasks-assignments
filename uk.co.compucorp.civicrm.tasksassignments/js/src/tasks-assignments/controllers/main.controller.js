/* eslint-env amd */

define([
  'common/lodash'
], function (_) {
  'use strict';

  MainController.__name = 'MainController';
  MainController.$inject = [
    '$log', '$q', '$rootElement', '$rootScope',
    '$scope', '$uibModal', 'beforeHashQueryParams', 'config', 'fileServiceTA'
  ];

  function MainController ($log, $q, $rootElement,
    $rootScope, $scope, $modal, beforeHashQueryParams, config, fileServiceTA) {
    $log.debug('Controller: MainController');

    $rootScope.modalAssignment = modalAssignment;
    $rootScope.modalDocument = modalDocument;
    $rootScope.modalReminder = modalReminder;
    $rootScope.modalTask = modalTask;

    (function init () {
      var queryParams = beforeHashQueryParams.parse();

      queryParams.openModal && autoOpenModal(queryParams.openModal);
    }());

    /**
     * Automatically opens the modal of the given type
     *
     * @param {String} modalType
     */
    function autoOpenModal (modalType) {
      var method = $rootScope['modal' + _.capitalize(modalType)];

      (typeof method === 'function') && method();
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
        templateUrl: config.path.TPL + 'modal/assignment.html?v=3',
        controller: 'ModalAssignmentController',
        size: 'lg',
        resolve: {
          data: function () {
            return data;
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
     * @param {string} modalMode Mode of the Modal, 'edit' or 'new'
     * @param {object} data Document data
     * @param {object} e Triggered event
     */
    function modalDocument (modalMode, data, e) {
      var modalInstance;

      e && e.preventDefault();

      modalMode = modalMode || 'new';
      data = data || {};
      modalInstance = $modal.open({
        appendTo: $rootElement.find('div').eq(0),
        templateUrl: config.path.TPL + 'modal/document.html?v=3',
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
        templateUrl: config.path.TPL + 'modal/reminder.html?v=1',
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
        templateUrl: config.path.TPL + 'modal/task.html?v=5',
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

  return MainController;
});
