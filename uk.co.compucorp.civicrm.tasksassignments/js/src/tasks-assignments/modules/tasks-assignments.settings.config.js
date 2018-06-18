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

  function settingsConfig (config, $stateProvider, $urlRouterProvider,
    $resourceProvider, $httpProvider, $analyticsProvider, datepickerConfig,
    uiSelectConfig, $logProvider) {
    $logProvider.debugEnabled(config.DEBUG);

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('settings', {
        url: '/',
        controller: 'SettingsController',
        templateUrl: config.path.TPL + 'settings.html?v=5'
      });

    $analyticsProvider.withAutoBase(true);
    $analyticsProvider.settings.ga = {
      userId: _.get(CRM, 'vars.session.contact_id')
    };

    $resourceProvider.defaults.stripTrailingSlashes = false;
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    datepickerConfig.showWeeks = false;
    uiSelectConfig.theme = 'bootstrap';
  }
});
