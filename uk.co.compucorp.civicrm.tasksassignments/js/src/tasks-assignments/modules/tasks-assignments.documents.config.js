/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.documents.config', ['tasks-assignments.constants']).config(documentsConfig);

  documentsConfig.$inject = [
    'config', '$urlRouterProvider', '$stateProvider', '$resourceProvider',
    '$httpProvider', '$analyticsProvider', 'uibDatepickerConfig', 'uiSelectConfig',
    '$logProvider'
  ];

  function documentsConfig (config, $urlRouterProvider, $stateProvider, $resourceProvider,
    $httpProvider, $analyticsProvider, datepickerConfig, uiSelectConfig, $logProvider) {
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
          documentList: ['documentService', function (documentService) {
            return documentService.get({
              'target_contact_id': config.CONTACT_ID
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
