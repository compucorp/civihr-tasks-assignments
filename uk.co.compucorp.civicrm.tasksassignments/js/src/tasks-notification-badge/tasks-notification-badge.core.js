/* eslint-env amd */

define([
  'common/angular',
  'common/models/session.model',
  'common/modules/templates',
  'common/services/pub-sub',
  'common/components/notification-badge.component'
], function (angular) {
  angular.module('tasks-notification-badge.core', [
    'ngResource',
    'common.components',
    'common.models',
    'common.services',
    'common.templates'
  ]);
});
