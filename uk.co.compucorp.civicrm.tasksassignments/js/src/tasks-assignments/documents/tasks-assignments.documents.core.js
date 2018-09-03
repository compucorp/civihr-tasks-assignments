/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/modules/tasks-assignments.constants',
  'tasks-assignments/modules/tasks-assignments.controllers',
  'tasks-assignments/modules/tasks-assignments.core',
  'tasks-assignments/modules/tasks-assignments.directives',
  'tasks-assignments/modules/tasks-assignments.filters',
  'tasks-assignments/modules/tasks-assignments.resources',
  'tasks-assignments/modules/tasks-assignments.run',
  'tasks-assignments/modules/tasks-assignments.services',
  'tasks-assignments/modules/tasks-assignments.values'
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
    'tasks-assignments.resources',
    'tasks-assignments.services'
  ]);
});
