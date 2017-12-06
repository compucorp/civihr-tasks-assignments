/* eslint-env amd */

define(function () {
  'use strict';

  ModalProgressController.__name = 'ModalProgressController';
  ModalProgressController.$inject = [
    '$scope', '$uibModalInstance', '$q', '$timeout', 'uploader', 'entityId',
    'FileService', '$log'
  ];

  function ModalProgressController ($scope, $modalInstance, $q, $timeout, uploader,
    entityId, FileService, $log) {
    $log.debug('Controller: ModalProgressController');

    $scope.uploader = uploader;

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

    $scope.cancel = function () {
      $modalInstance.dismiss('File upload canceled');
    };
  }

  return ModalProgressController;
});
