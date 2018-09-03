/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.documents.constants', [])
    .constant('documents.settings', {
      baseUrl: CRM.tasksAssignments.extensionPath + '/js/src/tasks-assignments/documents/'
    });
});
