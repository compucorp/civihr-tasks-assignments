/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/modules/task-assignments.run'
], function (angular) {
  'use strict';

  angular.module('civitasks.app-settings', ['civitasks.run'])
    .config(['config', '$stateProvider', '$urlRouterProvider', '$resourceProvider', '$httpProvider',
      'uibDatepickerConfig', 'uiSelectConfig', '$logProvider',
      function (config, $stateProvider, $urlRouterProvider, $resourceProvider, $httpProvider,
        datepickerConfig, uiSelectConfig, $logProvider) {
        $logProvider.debugEnabled(config.DEBUG);

        $urlRouterProvider.otherwise('/');

        $stateProvider
        .state('settings', {
          url: '/',
          controller: 'SettingsCtrl',
          templateUrl: config.path.TPL + 'settings.html?v=5'
        });

        $resourceProvider.defaults.stripTrailingSlashes = false;

        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        datepickerConfig.showWeeks = false;

        uiSelectConfig.theme = 'bootstrap';
      }
    ]);
});
