/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/modules/tasks-assignments.constants',
  'tasks-assignments/modules/tasks-assignments.controllers',
  'tasks-assignments/modules/tasks-assignments.components',
  'tasks-assignments/modules/tasks-assignments.core',
  'tasks-assignments/modules/tasks-assignments.directives',
  'tasks-assignments/modules/tasks-assignments.filters',
  'tasks-assignments/modules/tasks-assignments.resources',
  'tasks-assignments/modules/tasks-assignments.run',
  'tasks-assignments/modules/tasks-assignments.services',
  'tasks-assignments/modules/tasks-assignments.values',
  'tasks-assignments/modules/tasks-assignments.tasks.config'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.tasks', [
    'tasks-assignments.core',
    'tasks-assignments.run',
    'tasks-assignments.values',
    'tasks-assignments.constants',
    'tasks-assignments.controllers',
    'tasks-assignments.components',
    'tasks-assignments.directives',
    'tasks-assignments.filters',
    'tasks-assignments.resources',
    'tasks-assignments.services',
    'tasks-assignments.tasks.config'
  ]);
});
