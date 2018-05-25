/* eslint-env amd */

define([
  'common/angular',
  'common/models/session.model',
  'common/modules/templates',
  'common/services/pub-sub',
  'common/components/notification-badge.component',
  'tasks-notification-badge/modules/config',
  'tasks-notification-badge/components/tasks-notification-badge.component'
], function (angular) {
  angular.module('tasks-notification-badge', [
    'ngResource',
    'common.components',
    'common.models',
    'common.services',
    'common.templates',
    'tasks-notification-badge.settings',
    'tasks-notification-badge.components',
    'tasks-notification-badge.config'
  ])
    .run(['$log', function ($log) {
      $log.debug('app.run');
    }]);

  return angular;
});
