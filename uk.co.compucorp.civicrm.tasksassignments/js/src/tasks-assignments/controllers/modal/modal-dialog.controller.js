/* eslint-env amd */

define(function () {
  'use strict';

  ModalDialogController.__name = 'ModalDialogController';
  ModalDialogController.$inject = [
    '$scope', '$uibModalInstance', '$timeout', 'content', '$log'
  ];

  function ModalDialogController ($scope, $modalInstance, $timeout, content, $log) {
    $log.debug('Controller: ModalDialogController');

    $scope.title = content.title || 'CiviHR Tasks & Assignments';
    $scope.msg = content.msg || '';
    $scope.copyConfirm = content.copyConfirm || 'Yes';
    $scope.copyCancel = content.copyCancel || 'Cancel';

    $scope.confirm = function (action) {
      $modalInstance.close(action || true);
    };

    $scope.cancel = function () {
      $modalInstance.close(false);
    };
  }

  return ModalDialogController;
});
