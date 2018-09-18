/* eslint-env amd */

define([
  'common/angular',
  'tasks-notification-badge/components/tasks-notification-badge.component',
  'tasks-notification-badge/tasks-notification-badge.config',
  'tasks-notification-badge/tasks-notification-badge.constants',
  'tasks-notification-badge/tasks-notification-badge.core'
], function (angular, tasksNotificationBadge) {
  angular.module('tasks-notification-badge', [
    'tasks-notification-badge.core',
    'tasks-notification-badge.constants',
    'tasks-notification-badge.config'
  ])
    .component(tasksNotificationBadge);

  return angular;
});
