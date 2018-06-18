/* eslint-env amd */

define([
  'common/angular',
  'common/lodash'
], function (angular, _) {
  'use strict';

  angular.module('tasks-assignments.settings.config', ['tasks-assignments.constants']).config(settingsConfig);

  settingsConfig.$inject = [
    'config', '$stateProvider', '$urlRouterProvider', '$resourceProvider',
    '$httpProvider', '$analyticsProvider', 'uibDatepickerConfig', 'uiSelectConfig',
    '$logProvider'
  ];

  /**
   * Configures Google Analytics via the angulartics provider
   *
   * @param {Object} $analyticsProvider
   */
  function configureAnalytics ($analyticsProvider) {
    $analyticsProvider.withAutoBase(true);
    $analyticsProvider.settings.ga = {
      userId: _.get(CRM, 'vars.session.contact_id')
    };
  }

  function settingsConfig (config, $stateProvider, $urlRouterProvider,
    $resourceProvider, $httpProvider, $analyticsProvider, datepickerConfig,
    uiSelectConfig, $logProvider) {
    configureAnalytics($analyticsProvider);

    $logProvider.debugEnabled(config.DEBUG);
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $resourceProvider.defaults.stripTrailingSlashes = false;
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('settings', {
        url: '/',
        controller: 'SettingsController',
        templateUrl: config.path.TPL + 'settings.html?v=5'
      });

    datepickerConfig.showWeeks = false;
    uiSelectConfig.theme = 'bootstrap';
  }
});
