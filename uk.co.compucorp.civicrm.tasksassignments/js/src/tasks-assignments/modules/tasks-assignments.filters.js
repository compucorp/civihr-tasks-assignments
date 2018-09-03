/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/filters/assignment-type.filter',
  'tasks-assignments/filters/contact-id.filter',
  'tasks-assignments/filters/date-field.filter',
  'tasks-assignments/filters/date-parse.filter',
  'tasks-assignments/filters/date-type.filter',
  'tasks-assignments/filters/date.filter',
  'tasks-assignments/filters/offset.filter',
  'tasks-assignments/filters/ownership.filter',
  'tasks-assignments/filters/status.filter'
], function (angular, filterByAssignmentType, filterByContactId, filterByDateField,
  dateParse, filterByDateType, filterByDate, offset, filterByOwnership, filterByStatus) {
  'use strict';

  return angular.module('tasks-assignments.filters', [])
    .filter(filterByAssignmentType)
    .filter(filterByContactId)
    .filter(filterByDateField)
    .filter(dateParse)
    .filter(filterByDateType)
    .filter(filterByDate)
    .filter(offset)
    .filter(filterByOwnership)
    .filter(filterByStatus);
});
