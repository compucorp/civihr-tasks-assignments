/* eslint-env amd */

define(function () {
  'use strict';

  MainController.__name = 'MainController';
  MainController.$inject = [
    'beforeHashQueryParams', '$log', '$q', '$rootElement', '$rootScope',
    '$scope', '$uibModal', 'config', 'fileServiceTA'
  ];

  function MainController (beforeHashQueryParams, $log, $q, $rootElement,
    $rootScope, $scope, $modal, config, fileServiceTA) {
    $log.debug('Controller: MainController');

    var params = beforeHashQueryParams.parse();

    $rootScope.modalAssignment = modalAssignment;
    $rootScope.modalDocument = modalDocument;
    $rootScope.modalReminder = modalReminder;
    $rootScope.modalTask = modalTask;

    (function init () {
      if (params.openModal) {
        params.openModal === 'task' && $rootScope.modalTask();
        params.openModal === 'assignment' && $rootScope.modalAssignment();
        params.openModal === 'document' && $rootScope.modalDocument();
      }
    }());

    function modalAssignment (data) {
      data = data || {};
      var modalInstance = $modal.open({
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
     * @param {string} modalMode - Mode of the Modal, 'edit' or 'new'
     * @param {object} data - Document data
     * @param {object} e - Triggered event
     */
    function modalDocument (modalMode, data, e) {
      e && e.preventDefault();

      modalMode = modalMode || 'new';
      data = data || {};

      var modalInstance = $modal.open({
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

    function modalTask (data) {
      data = data || {};
      var modalInstance = $modal.open({
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
