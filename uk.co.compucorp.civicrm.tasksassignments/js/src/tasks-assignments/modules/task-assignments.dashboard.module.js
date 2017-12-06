/* eslint-env amd */

define([
  'common/angular',
  'common/services/angular-date/date-format',
  'tasks-assignments/modules/task-assignments.constants',
  'tasks-assignments/modules/task-assignments.controllers',
  'tasks-assignments/modules/task-assignments.directives',
  'tasks-assignments/modules/task-assignments.filters',
  'tasks-assignments/modules/task-assignments.resources',
  'tasks-assignments/modules/task-assignments.run',
  'tasks-assignments/modules/task-assignments.services',
  'tasks-assignments/modules/task-assignments.values',
  'tasks-assignments/modules/task-assignments.dashboard.config'
], function (angular) {
  'use strict';

  angular.module('task-assignments.dashboard', [
    'task-assignments.constants',
    'task-assignments.controllers',
    'task-assignments.directives',
    'task-assignments.filters',
    'task-assignments.resources',
    'task-assignments.run',
    'task-assignments.services',
    'task-assignments.values',
    'task-assignments.dashboard.config'
  ]);
});
