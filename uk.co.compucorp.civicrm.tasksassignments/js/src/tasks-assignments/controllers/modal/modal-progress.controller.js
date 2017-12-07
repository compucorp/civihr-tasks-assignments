/* eslint-env amd */

define(function () {
  'use strict';

  ModalProgressController.__name = 'ModalProgressController';
  ModalProgressController.$inject = [
    '$log', '$q', '$scope', '$timeout', '$uibModalInstance', 'FileService',
    'uploader', 'entityId'
  ];

  function ModalProgressController ($log, $q, $scope, $timeout, $modalInstance,
    FileService, uploader, entityId) {
    $log.debug('Controller: ModalProgressController');

    $scope.uploader = uploader;

    $scope.cancel = cancel;

    (function init () {
      if (uploader.queue.length) {
        uploader.item = uploader.queue[0].file.name;
      }

      uploader.onProgressItem = function (item) {
        this.item = item.file.name;
      };

      FileService.upload(uploader, entityId).then(function (results) {
        $timeout(function () {
          $modalInstance.close(results);
        }, 500);
      });
    }());

    function cancel () {
      $modalInstance.dismiss('File upload canceled');
    }
  }

  return ModalProgressController;
});
