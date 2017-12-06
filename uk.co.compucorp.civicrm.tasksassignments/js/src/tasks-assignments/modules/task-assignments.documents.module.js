/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/modules/task-assignments.constants',
  'tasks-assignments/modules/task-assignments.controllers',
  'tasks-assignments/modules/task-assignments.core',
  'tasks-assignments/modules/task-assignments.directives',
  'tasks-assignments/modules/task-assignments.filters',
  'tasks-assignments/modules/task-assignments.resources',
  'tasks-assignments/modules/task-assignments.run',
  'tasks-assignments/modules/task-assignments.services',
  'tasks-assignments/modules/task-assignments.values',
  'tasks-assignments/modules/task-assignments.documents.config'
], function (angular) {
  'use strict';

  angular.module('task-assignments.documents', [
    'task-assignments.core',
    'task-assignments.run',
    'task-assignments.constants',
    'task-assignments.values',
    'task-assignments.controllers',
    'task-assignments.directives',
    'task-assignments.filters',
    'task-assignments.resources',
    'task-assignments.services',
    'task-assignments.documents.config'
  ]);
});
