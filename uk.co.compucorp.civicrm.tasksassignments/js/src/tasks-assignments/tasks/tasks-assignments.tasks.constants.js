/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.tasks.constants', [])
    .constant('tasks.settings', {
      baseUrl: CRM.tasksAssignments.extensionPath + '/js/src/tasks-assignments/tasks/'
    });
});
