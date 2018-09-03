/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/controllers/assignments.controller',
  'tasks-assignments/controllers/calendar.controller',
  'tasks-assignments/controllers/date-list.controller',
  'tasks-assignments/controllers/document-list.controller',
  'tasks-assignments/controllers/document.controller',
  'tasks-assignments/controllers/external-page.controller',
  'tasks-assignments/controllers/main.controller',
  'tasks-assignments/controllers/task-list.controller',
  'tasks-assignments/controllers/task.controller',
  'tasks-assignments/controllers/dashboard/nav-main.controller',
  'tasks-assignments/controllers/dashboard/top-bar.controller',
  'tasks-assignments/controllers/modal/modal-assignment-activity.controller',
  'tasks-assignments/controllers/modal/modal-assignment.controller',
  'tasks-assignments/controllers/modal/modal-dialog.controller',
  'tasks-assignments/controllers/modal/modal-document.controller',
  'tasks-assignments/controllers/modal/modal-progress.controller',
  'tasks-assignments/controllers/modal/modal-reminder.controller',
  'tasks-assignments/controllers/modal/modal-task-migrate.controller',
  'tasks-assignments/controllers/modal/modal-task.controller'
], function (angular, AssignmentsController, CalendarController, DateListController, DocumentListController,
  DocumentController, ExternalPageController, MainController, TaskListController,
  TaskController, NavMainController, TopBarController, ModalAssignmentActivityController, ModalAssignmentController,
  ModalDialogController, ModalDocumentController, ModalProgressController, ModalReminderController,
  ModalTaskMigrateController, ModalTaskController) {
  'use strict';

  return angular.module('tasks-assignments.controllers', [])
    .controller(AssignmentsController)
    .controller(CalendarController)
    .controller(DateListController)
    .controller(DocumentListController)
    .controller(DocumentController)
    .controller(ExternalPageController)
    .controller(MainController)
    .controller(TaskListController)
    .controller(TaskController)
    .controller(NavMainController)
    .controller(TopBarController)
    .controller(ModalAssignmentActivityController)
    .controller(ModalAssignmentController)
    .controller(ModalDialogController)
    .controller(ModalDocumentController)
    .controller(ModalProgressController)
    .controller(ModalReminderController)
    .controller(ModalTaskMigrateController)
    .controller(ModalTaskController);
});
