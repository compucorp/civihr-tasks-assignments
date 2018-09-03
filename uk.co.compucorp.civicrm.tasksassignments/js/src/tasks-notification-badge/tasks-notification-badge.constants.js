/* eslint-env amd */

(function (CRM) {
  define([
    'common/angular'
  ], function (angular) {
    'use strict';

    angular.module('tasks-notification-badge.constants', []).constant('settings', {
      debug: +CRM.debug,
      pathTpl: CRM.tasksAssignments.extensionPath + '/views/tasks-notification-badge/'
    });
  });
})(CRM);
