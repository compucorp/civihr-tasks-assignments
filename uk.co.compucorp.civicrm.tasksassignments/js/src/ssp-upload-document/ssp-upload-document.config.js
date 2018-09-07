/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  angular.module('ssp-upload-document.config', []).config(config);

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config ($urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true); // This is required to remove # for the URL
    $urlRouterProvider.otherwise('/tasks-and-documents');
  }
});
