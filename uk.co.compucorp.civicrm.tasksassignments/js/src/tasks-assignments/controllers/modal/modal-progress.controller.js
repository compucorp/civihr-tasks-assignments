/* eslint-env amd */

define([
  'tasks-assignments/controllers/controllers',
  'tasks-assignments/services/file.service'
], function (controllers) {
  'use strict';

  controllers.controller('ModalProgressCtrl', ['$scope', '$uibModalInstance', '$q', '$timeout', 'uploader',
    'entityId', 'FileService', '$log',
    function ($scope, $modalInstance, $q, $timeout, uploader, entityId, FileService, $log) {
      $log.debug('Controller: ModalProgressCtrl');

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
    }]);
});
