/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.dashboard.constants', []).constant('dashboard.settings', {
    baseUrl: CRM.tasksAssignments.extensionPath + '/js/src/tasks-assignments/dashboard/'
  });
});
