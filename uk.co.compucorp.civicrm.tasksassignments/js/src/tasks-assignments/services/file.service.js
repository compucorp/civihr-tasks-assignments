/* eslint-env amd */

define(function () {
  'use strict';

  fileServiceTA.$inject = [
    '$resource', 'config', '$q', 'utilsService', 'FileUploader', '$log'
  ];

  function fileServiceTA ($resource, config, $q, utilsService, FileUploader, $log) {
    $log.debug('Service: fileServiceTA');

    var File = $resource(config.url.FILE + '/:action');
    FileUploader.prototype.queueDelete = [];

    return {
      delete: deleteFile,
      get: get,
      upload: upload,
      uploader: uploader
    };

    function deleteFile (fileId, entityId, entityTable) {
      if ((!fileId || typeof +fileId !== 'number') ||
        (!entityId || typeof +entityId !== 'number') ||
        (!entityTable || typeof entityTable !== 'string')) {
        return null;
      }

      var deferred = $q.defer();

      File.save({
        action: 'delete',
        entityTable: entityTable,
        entityID: entityId,
        fileID: fileId
      }, null, function (data) {
        if (data.values && !+data.values[0].result) {
          data.is_error = 1;
        }

        if (utilsService.errorHandler(data, 'Unable to delete file', deferred)) {
          return;
        }

        deferred.resolve(data.values[0]);
      }, function () {
        deferred.reject('Unable to delete file');
      });

      return deferred.promise;
    }

    function get (entityId, entityTable) {
      if ((!entityId || typeof +entityId !== 'number') ||
        (!entityTable || typeof entityTable !== 'string')) {
        return null;
      }

      var deferred = $q.defer();

      File.get({
        action: 'list',
        entityTable: entityTable,
        entityID: entityId
      }, function (data) {
        if (utilsService.errorHandler(data, 'Unable to fetch files', deferred)) {
          return;
        }

        deferred.resolve(data.values);
      }, function () {
        deferred.reject('Unable to fetch files');
      });

      return deferred.promise;
    }

    function upload (uploaderInstance, entityId) {
      if (!uploaderInstance || typeof uploaderInstance !== 'object' ||
        !entityId || typeof +entityId !== 'number') {
        return null;
      }

      var deferred = $q.defer();
      var results = [];

      uploaderInstance.onBeforeUploadItem = function (item) {
        item.formData.push({
          entityID: entityId
        });
      };

      uploaderInstance.onCompleteItem = function (item, response) {
        results.push(response);
      };

      uploaderInstance.onErrorItem = function (item, response, status, headers) {
        deferred.reject('Could not upload file: ' + item.file.name);
        $log.error(' ===== Item Error: ' + status + ' ======');
        $log.error(' =====  - item ======');
        $log.error(item);
        $log.error(' =====  - response ======');
        $log.error(response);
        $log.error(' =====  - headers ======');
        $log.error(headers);
      };

      uploaderInstance.onCompleteAll = function () {
        deferred.resolve(results);
      };

      uploaderInstance.uploadAll();

      return deferred.promise;
    }

    function uploader (entityTable, queueLimit) {
      if (!entityTable || typeof entityTable !== 'string') {
        return null;
      }

      var uploaderSettings = {
        url: config.url.FILE + '/upload',
        formData: [{
          entityTable: entityTable
        }]
      };

      if (queueLimit && typeof queueLimit === 'number') {
        uploaderSettings.queueLimit = queueLimit;
      }

      return new FileUploader(uploaderSettings);
    }
  }

  return { fileServiceTA: fileServiceTA };
});
