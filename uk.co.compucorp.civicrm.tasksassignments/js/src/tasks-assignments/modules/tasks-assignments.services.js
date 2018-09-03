/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/services/app-settings.service',
  'tasks-assignments/services/assignment.service',
  'tasks-assignments/services/contact.service',
  'tasks-assignments/services/dialog.service',
  'tasks-assignments/services/document.service',
  'tasks-assignments/services/file.service',
  'tasks-assignments/services/key-date.service',
  'tasks-assignments/services/task.service',
  'tasks-assignments/services/utils.service'
], function (angular, appSettingsService, assignmentService, contactService,
  $dialog, documentService, fileServiceTA, keyDateService, taskService, utilsService) {
  'use strict';

  return angular.module('tasks-assignments.services', [])
    .factory(appSettingsService)
    .factory(assignmentService)
    .factory(contactService)
    .factory($dialog)
    .factory(documentService)
    .factory(fileServiceTA)
    .factory(keyDateService)
    .factory(taskService)
    .factory(utilsService);
});
