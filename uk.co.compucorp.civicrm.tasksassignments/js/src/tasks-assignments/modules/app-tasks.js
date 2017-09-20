/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/modules/run.module'
], function (angular) {
  'use strict';

  angular.module('civitasks.appTasks', ['civitasks.run'])
    .config(['config', '$urlRouterProvider', '$stateProvider', '$resourceProvider', '$httpProvider',
      'uibDatepickerConfig', 'uiSelectConfig',
      '$logProvider',
      function (config, $urlRouterProvider, $stateProvider, $resourceProvider, $httpProvider, datepickerConfig,
        uiSelectConfig,
        $logProvider) {
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
            templateUrl: config.path.TPL + 'contact/tasks.html?v=222',
            controllerAs: 'List',
            resolve: {
              taskList: ['TaskService', function (TaskService) {
                return TaskService.get({
                  'target_contact_id': config.CONTACT_ID,
                  'status_id': {
                    'NOT IN': config.status.resolve.TASK
                  }
                });
              }]
            }
          });

        $resourceProvider.defaults.stripTrailingSlashes = false;

        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        datepickerConfig.showWeeks = false;

        uiSelectConfig.theme = 'bootstrap';
      }
    ]);
});
