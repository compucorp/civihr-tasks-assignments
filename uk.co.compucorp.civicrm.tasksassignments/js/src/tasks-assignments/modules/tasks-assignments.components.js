/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/components/task-details.component'
], function (angular, taskDetails) {
  'use strict';

  return angular.module('tasks-assignments.components', [])
    .component(taskDetails.__name, taskDetails);
});
