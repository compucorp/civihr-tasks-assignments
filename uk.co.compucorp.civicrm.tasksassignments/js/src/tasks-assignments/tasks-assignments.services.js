/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/services/app-settings.resource',
  'tasks-assignments/services/app-settings.service',
  'tasks-assignments/services/assignment.resource',
  'tasks-assignments/services/assignment-search.resource',
  'tasks-assignments/services/assignment-type.resource',
  'tasks-assignments/services/assignment.service',
  'tasks-assignments/services/contact.resource',
  'tasks-assignments/services/contact.service',
  'tasks-assignments/services/dialog.service',
  'tasks-assignments/services/document.resource',
  'tasks-assignments/services/document.service',
  'tasks-assignments/services/file.service',
  'tasks-assignments/services/relationship.resource',
  'tasks-assignments/services/task.resource',
  'tasks-assignments/services/task.service',
  'tasks-assignments/services/utils.service'
], function (angular, AppSettings, appSettingsService, Assignment, AssignmentSearch,
  AssignmentType, assignmentService, Contact, contactService, $dialog, Document,
  documentService, fileServiceTA, Relationship, Task, taskService, utilsService) {
  'use strict';

  return angular.module('tasks-assignments.services', [])
    .factory(AppSettings)
    .factory(appSettingsService)
    .factory(Assignment)
    .factory(AssignmentSearch)
    .factory(AssignmentType)
    .factory(assignmentService)
    .factory(Contact)
    .factory(contactService)
    .factory($dialog)
    .factory(Document)
    .factory(documentService)
    .factory(fileServiceTA)
    .factory(Relationship)
    .factory(Task)
    .factory(taskService)
    .factory(utilsService);
});
