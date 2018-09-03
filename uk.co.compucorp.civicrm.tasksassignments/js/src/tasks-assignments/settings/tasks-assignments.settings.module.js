/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/settings/controllers/settings.controller',
  'tasks-assignments/settings/services/settings.resource',
  'tasks-assignments/settings/services/settings.service',
  'tasks-assignments/settings/tasks-assignments.settings.config',
  'tasks-assignments/settings/tasks-assignments.settings.core'
], function (angular, SettingsController, Settings, settingsService) {
  'use strict';

  angular.module('tasks-assignments.settings', [
    'tasks-assignments.settings.core',
    'tasks-assignments.settings.config'
  ])
    .controller(SettingsController)
    .factory(Settings)
    .factory(settingsService);
});
