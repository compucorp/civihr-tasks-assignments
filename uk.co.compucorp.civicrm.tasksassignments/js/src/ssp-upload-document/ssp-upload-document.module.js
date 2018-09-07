/* eslint-env amd */

define([
  'common/angular',
  'ssp-upload-document/controllers/modal.controller',
  'ssp-upload-document/ssp-upload-document.core',
  'ssp-upload-document/ssp-upload-document.config'
], function (angular, ModalController) {
  angular.module('ssp-upload-document', [
    'ssp-upload-document.core',
    'ssp-upload-document.config'
  ])
    .controller(ModalController);

  return angular;
});
