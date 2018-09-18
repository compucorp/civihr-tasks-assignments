/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/tasks-assignments.constants',
  'tasks-assignments/tasks-assignments.controllers',
  'tasks-assignments/tasks-assignments.core',
  'tasks-assignments/tasks-assignments.directives',
  'tasks-assignments/tasks-assignments.filters',
  'tasks-assignments/tasks-assignments.run',
  'tasks-assignments/tasks-assignments.services',
  'tasks-assignments/tasks-assignments.values'
], function (angular) {
  'use strict';

  angular.module('tasks-assignments.documents.core', [
    'tasks-assignments.core',
    'tasks-assignments.run',
    'tasks-assignments.constants',
    'tasks-assignments.values',
    'tasks-assignments.controllers',
    'tasks-assignments.directives',
    'tasks-assignments.filters',
    'tasks-assignments.services'
  ]);
});
