/* eslint-env amd */

define([
  'common/angular',
  'common/lodash'
], function (angular, _) {
  'use strict';

  angular.module('tasks-assignments.settings.config', [
    'tasks-assignments.constants',
    'tasks-assignments.settings.constants'
  ]).config(settingsConfig);

  settingsConfig.$inject = [
    'config', 'settings.settings', '$stateProvider', '$urlRouterProvider', '$resourceProvider',
    '$httpProvider', '$analyticsProvider', 'uibDatepickerConfig', 'uiSelectConfig',
    '$logProvider'
  ];

  /**
   * Configures Google Analytics via the angulartics provider
   *
   * @param {Object} $analyticsProvider
   */
  function configureAnalytics ($analyticsProvider) {
    $analyticsProvider.settings.ga = {
      userId: _.get(CRM, 'vars.session.contact_id')
    };

    $analyticsProvider.withAutoBase(true);
  }

  function settingsConfig (config, settings, $stateProvider, $urlRouterProvider,
    $resourceProvider, $httpProvider, $analyticsProvider, datepickerConfig,
    uiSelectConfig, $logProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $resourceProvider.defaults.stripTrailingSlashes = false;
    datepickerConfig.showWeeks = false;
    uiSelectConfig.theme = 'bootstrap';

    configureAnalytics($analyticsProvider);
    $logProvider.debugEnabled(config.DEBUG);
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('settings', {
        url: '/',
        controller: 'SettingsController',
        templateUrl: settings.baseUrl + 'controllers/settings.html'
      });
  }
});
