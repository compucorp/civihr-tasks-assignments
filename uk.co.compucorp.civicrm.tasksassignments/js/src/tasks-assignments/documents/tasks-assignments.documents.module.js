/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/documents/tasks-assignments.documents.core',
  'tasks-assignments/documents/tasks-assignments.documents.config',
  'tasks-assignments/documents/tasks-assignments.documents.constants'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.documents', [
    'tasks-assignments.documents.core',
    'tasks-assignments.documents.config',
    'tasks-assignments.documents.constants'
  ]);
});
