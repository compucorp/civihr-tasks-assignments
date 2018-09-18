/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.tasks.config', [
    'tasks-assignments.constants',
    'tasks-assignments.tasks.constants'
  ]).config(tasksConfig);

  tasksConfig.$inject = [
    'config', '$urlRouterProvider', '$stateProvider', '$resourceProvider',
    '$httpProvider', '$analyticsProvider', 'uibDatepickerConfig', 'uiSelectConfig',
    '$logProvider', 'tasks.settings'
  ];

  function tasksConfig (config, $urlRouterProvider, $stateProvider, $resourceProvider,
    $httpProvider, $analyticsProvider, datepickerConfig, uiSelectConfig, $logProvider,
    tasksSettings) {
    $logProvider.debugEnabled(config.DEBUG);

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .resolveForAll({
        format: ['DateFormat', function (DateFormat) {
          return DateFormat.getDateFormat();
        }]
      })
      .state('main', {
        url: '/',
        controller: 'TaskListController',
        controllerAs: 'list',
        templateUrl: tasksSettings.baseUrl + 'templates/tasks.html',
        resolve: {
          taskList: ['taskService', function (taskService) {
            return taskService.get({
              'target_contact_id': config.CONTACT_ID,
              'status_id': {
                'NOT IN': config.status.resolve.TASK
              }
            });
          }]
        }
      });

    $analyticsProvider.virtualPageviews(false);

    $resourceProvider.defaults.stripTrailingSlashes = false;
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    datepickerConfig.showWeeks = false;
    uiSelectConfig.theme = 'bootstrap';
  }
});
