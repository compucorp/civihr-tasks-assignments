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
    .filter(filterByAssignmentType.__name, filterByAssignmentType)
    .filter(filterByContactId.__name, filterByContactId)
    .filter(filterByDateField.__name, filterByDateField)
    .filter(dateParse.__name, dateParse)
    .filter(filterByDateType.__name, filterByDateType)
    .filter(filterByDate.__name, filterByDate)
    .filter(offset.__name, offset)
    .filter(filterByOwnership.__name, filterByOwnership)
    .filter(filterByStatus.__name, filterByStatus);
});
