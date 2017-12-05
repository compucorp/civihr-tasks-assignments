/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/modules/task-assignments.constants',
  'tasks-assignments/modules/task-assignments.settings.module',
  'tasks-assignments/modules/task-assignments.controllers',
  'tasks-assignments/modules/task-assignments.directives',
  'tasks-assignments/modules/task-assignments.filters',
  'tasks-assignments/modules/task-assignments.resources',
  'tasks-assignments/modules/task-assignments.run',
  'tasks-assignments/modules/task-assignments.services',
  'tasks-assignments/modules/task-assignments.values'
], function (angular) {
  'use strict';

  angular.module('task-assignments.settings', [
    'task-assignments.constants',
    'task-assignments.controllers',
    'task-assignments.directives',
    'task-assignments.filters',
    'task-assignments.resources',
    'task-assignments.run',
    'task-assignments.services',
    'task-assignments.values'
  ])
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
