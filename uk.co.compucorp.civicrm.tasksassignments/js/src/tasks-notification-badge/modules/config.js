/* eslint-env amd */

(function (CRM) {
  define([
    'common/angular',
    'tasks-notification-badge/modules/settings'
  ], function (angular) {
    return angular.module('tasks-notification-badge.config', ['tasks-notification-badge.settings'])
      .config([
        '$resourceProvider', '$httpProvider', '$logProvider', 'settings',
        function ($resourceProvider, $httpProvider, $logProvider, settings) {
          $logProvider.debugEnabled(settings.debug);

          $resourceProvider.defaults.stripTrailingSlashes = false;
          $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        }
      ]);
  });
})(CRM);
