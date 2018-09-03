/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/filters/assignment-type.filter',
  'tasks-assignments/filters/date-field.filter',
  'tasks-assignments/filters/date-parse.filter',
  'tasks-assignments/filters/ownership.filter',
  'tasks-assignments/filters/status.filter'
], function (angular, filterByAssignmentType, filterByDateField,
  dateParse, filterByOwnership, filterByStatus) {
  'use strict';

  return angular.module('tasks-assignments.filters', [])
    .filter(filterByAssignmentType)
    .filter(filterByDateField)
    .filter(dateParse)
    .filter(filterByOwnership)
    .filter(filterByStatus);
});
