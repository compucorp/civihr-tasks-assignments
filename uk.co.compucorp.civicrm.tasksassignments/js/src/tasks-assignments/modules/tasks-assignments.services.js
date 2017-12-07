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
  'tasks-assignments/services/settings.service',
  'tasks-assignments/services/task.service',
  'tasks-assignments/services/utils.service'
], function (angular, appsettingsService, assignmentService, contactService,
  $dialog, documentService, fileServiceTA, keyDateService, settingsService,
  taskService, utilsService) {
  'use strict';

  return angular.module('tasks-assignments.services', [])
    .factory(appsettingsService.__name, appsettingsService)
    .factory(assignmentService.__name, assignmentService)
    .factory(contactService.__name, contactService)
    .factory($dialog.__name, $dialog)
    .factory(documentService.__name, documentService)
    .factory(fileServiceTA.__name, fileServiceTA)
    .factory(keyDateService.__name, keyDateService)
    .factory(settingsService.__name, settingsService)
    .factory(taskService.__name, taskService)
    .factory(utilsService.__name, utilsService);
});
