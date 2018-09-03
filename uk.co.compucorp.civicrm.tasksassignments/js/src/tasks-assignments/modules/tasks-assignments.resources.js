/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/resources/app-settings.resource',
  'tasks-assignments/resources/assignment-search.resource',
  'tasks-assignments/resources/assignment-type.resource',
  'tasks-assignments/resources/assignment.resource',
  'tasks-assignments/resources/contact.resource',
  'tasks-assignments/resources/document.resource',
  'tasks-assignments/resources/key-date.resource',
  'tasks-assignments/resources/relationship.resource',
  'tasks-assignments/resources/task.resource'
], function (angular, AppSettings, AssignmentSearch, AssignmentType,
  Assignment, Contact, Document, KeyDate, Relationship, Task) {
  'use strict';

  return angular.module('tasks-assignments.resources', [])
    .factory(AppSettings)
    .factory(AssignmentSearch)
    .factory(AssignmentType)
    .factory(Assignment)
    .factory(Contact)
    .factory(Document)
    .factory(KeyDate)
    .factory(Relationship)
    .factory(Task);
});
