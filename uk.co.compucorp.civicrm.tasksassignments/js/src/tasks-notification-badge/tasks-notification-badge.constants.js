/* eslint-env amd */

(function (CRM) {
  define([
    'common/angular'
  ], function (angular) {
    'use strict';

    angular.module('tasks-notification-badge.constants', []).constant('settings', {
      debug: +CRM.debug,
      baseUrl: CRM.tasksAssignments.extensionPath + '/js/src/tasks-notification-badge/'
    });
  });
})(CRM);
