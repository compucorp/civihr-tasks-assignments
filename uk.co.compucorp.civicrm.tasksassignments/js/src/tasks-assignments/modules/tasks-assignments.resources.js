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
  'tasks-assignments/resources/settings.resource',
  'tasks-assignments/resources/task.resource'
], function (angular, AppSettings, AssignmentSearch, AssignmentType,
  Assignment, Contact, Document, KeyDate, Relationship,
  Settings, Task) {
  'use strict';

  return angular.module('tasks-assignments.resources', [])
    .factory(AppSettings.__name, AppSettings)
    .factory(AssignmentSearch.__name, AssignmentSearch)
    .factory(AssignmentType.__name, AssignmentType)
    .factory(Assignment.__name, Assignment)
    .factory(Contact.__name, Contact)
    .factory(Document.__name, Document)
    .factory(KeyDate.__name, KeyDate)
    .factory(Relationship.__name, Relationship)
    .factory(Settings.__name, Settings)
    .factory(Task.__name, Task);
});
