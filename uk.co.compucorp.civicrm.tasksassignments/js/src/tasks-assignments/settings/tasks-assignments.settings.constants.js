/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.settings.constants', [])
    .constant('settings.settings', {
      baseUrl: CRM.tasksAssignments.extensionPath + '/js/src/tasks-assignments/settings/'
    });
});
