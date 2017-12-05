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
], function (angular, AppSettingsService, AssignmentService, ContactService,
  $dialog, DocumentService, FileService, KeyDateService, SettingsService,
  TaskService, UtilsService) {
  'use strict';

  return angular.module('civitasks.services', [])
    .factory(AppSettingsService.__name, AppSettingsService)
    .factory(AssignmentService.__name, AssignmentService)
    .factory(ContactService.__name, ContactService)
    .factory($dialog.__name, $dialog)
    .factory(DocumentService.__name, DocumentService)
    .factory(FileService.__name, FileService)
    .factory(KeyDateService.__name, KeyDateService)
    .factory(SettingsService.__name, SettingsService)
    .factory(TaskService.__name, TaskService)
    .factory(UtilsService.__name, UtilsService);
});
