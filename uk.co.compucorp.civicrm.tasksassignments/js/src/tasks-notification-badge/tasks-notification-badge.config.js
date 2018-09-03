/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-notification-badge.config', ['tasks-notification-badge.constants']).config(config);

  config.$inject = ['$resourceProvider', '$httpProvider', '$logProvider', 'settings'];

  function config ($resourceProvider, $httpProvider, $logProvider, settings) {
    $logProvider.debugEnabled(settings.debug);

    $resourceProvider.defaults.stripTrailingSlashes = false;
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  }
});
