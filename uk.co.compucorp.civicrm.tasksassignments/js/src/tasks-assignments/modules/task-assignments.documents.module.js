/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/modules/task-assignments.constants',
  'tasks-assignments/modules/task-assignments.documents.module',
  'tasks-assignments/modules/task-assignments.controllers',
  'tasks-assignments/modules/task-assignments.directives',
  'tasks-assignments/modules/task-assignments.filters',
  'tasks-assignments/modules/task-assignments.resources',
  'tasks-assignments/modules/task-assignments.run',
  'tasks-assignments/modules/task-assignments.services',
  'tasks-assignments/modules/task-assignments.values'
], function (angular) {
  'use strict';

  angular.module('task-assignments.documents', [
    'task-assignments.constants',
    'task-assignments.controllers',
    'task-assignments.directives',
    'task-assignments.filters',
    'task-assignments.resources',
    'task-assignments.run',
    'task-assignments.services',
    'task-assignments.values'
  ])
  .config(['config', '$urlRouterProvider', '$stateProvider', '$resourceProvider', '$httpProvider',
    'uibDatepickerConfig', 'uiSelectConfig', '$logProvider',
    function (config, $urlRouterProvider, $stateProvider, $resourceProvider, $httpProvider, datepickerConfig,
      uiSelectConfig, $logProvider) {
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
          controller: 'DocumentListController',
          controllerAs: 'list',
          templateUrl: config.path.TPL + 'contact/documents.html?v=4',
          resolve: {
            documentList: ['DocumentService', function (DocumentService) {
              return DocumentService.get({
                'target_contact_id': config.CONTACT_ID
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
