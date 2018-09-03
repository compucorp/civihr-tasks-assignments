/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/controllers/assignments.controller',
  'tasks-assignments/controllers/document-list.controller',
  'tasks-assignments/controllers/document.controller',
  'tasks-assignments/controllers/main.controller',
  'tasks-assignments/controllers/task-list.controller',
  'tasks-assignments/controllers/task.controller',
  'tasks-assignments/controllers/modal/modal-assignment-activity.controller',
  'tasks-assignments/controllers/modal/modal-assignment.controller',
  'tasks-assignments/controllers/modal/modal-dialog.controller',
  'tasks-assignments/controllers/modal/modal-document.controller',
  'tasks-assignments/controllers/modal/modal-progress.controller',
  'tasks-assignments/controllers/modal/modal-reminder.controller',
  'tasks-assignments/controllers/modal/modal-task-migrate.controller',
  'tasks-assignments/controllers/modal/modal-task.controller'
], function (angular, AssignmentsController, DocumentListController,
  DocumentController, MainController, TaskListController,
  TaskController, ModalAssignmentActivityController, ModalAssignmentController,
  ModalDialogController, ModalDocumentController, ModalProgressController, ModalReminderController,
  ModalTaskMigrateController, ModalTaskController) {
  'use strict';

  return angular.module('tasks-assignments.controllers', [])
    .controller(AssignmentsController)
    .controller(DocumentListController)
    .controller(DocumentController)
    .controller(MainController)
    .controller(TaskListController)
    .controller(TaskController)
    .controller(ModalAssignmentActivityController)
    .controller(ModalAssignmentController)
    .controller(ModalDialogController)
    .controller(ModalDocumentController)
    .controller(ModalProgressController)
    .controller(ModalReminderController)
    .controller(ModalTaskMigrateController)
    .controller(ModalTaskController);
});
