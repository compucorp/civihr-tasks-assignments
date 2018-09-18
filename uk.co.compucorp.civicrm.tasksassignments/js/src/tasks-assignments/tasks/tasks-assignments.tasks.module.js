/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/tasks/tasks-assignments.tasks.core',
  'tasks-assignments/tasks/tasks-assignments.tasks.config',
  'tasks-assignments/tasks/tasks-assignments.tasks.constants'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.tasks', [
    'tasks-assignments.tasks.core',
    'tasks-assignments.tasks.config',
    'tasks-assignments.tasks.constants'
  ]);
});
