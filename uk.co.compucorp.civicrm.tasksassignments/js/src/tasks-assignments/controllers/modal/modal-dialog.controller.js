/* eslint-env amd */

define(function () {
  'use strict';

  ModalDialogController.$inject = ['$log', '$scope', '$uibModalInstance', 'content'];

  function ModalDialogController ($log, $scope, $modalInstance, content) {
    $log.debug('Controller: ModalDialogController');

    $scope.copyCancel = content.copyCancel || 'Cancel';
    $scope.copyConfirm = content.copyConfirm || 'Yes';
    $scope.msg = content.msg || '';
    $scope.title = content.title || 'CiviHR Tasks & Workflows';

    $scope.confirm = confirm;
    $scope.cancel = cancel;

    function cancel () {
      $modalInstance.close(false);
    }

    function confirm (action) {
      $modalInstance.close(action || true);
    }
  }

  return { ModalDialogController: ModalDialogController };
});
