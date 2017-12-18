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
  'tasks-assignments/controllers/settings.controller',
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
  DocumentController, ExternalPageController, MainController, SettingsController, TaskListController,
  TaskController, NavMainController, TopBarController, ModalAssignmentActivityController, ModalAssignmentController,
  ModalDialogController, ModalDocumentController, ModalProgressController, ModalReminderController,
  ModalTaskMigrateController, ModalTaskController) {
  'use strict';

  return angular.module('tasks-assignments.controllers', [])
    .controller(AssignmentsController.__name, AssignmentsController)
    .controller(CalendarController.__name, CalendarController)
    .controller(DateListController.__name, DateListController)
    .controller(DocumentListController.__name, DocumentListController)
    .controller(DocumentController.__name, DocumentController)
    .controller(ExternalPageController.__name, ExternalPageController)
    .controller(MainController.__name, MainController)
    .controller(SettingsController.__name, SettingsController)
    .controller(TaskListController.__name, TaskListController)
    .controller(TaskController.__name, TaskController)
    .controller(NavMainController.__name, NavMainController)
    .controller(TopBarController.__name, TopBarController)
    .controller(ModalAssignmentActivityController.__name, ModalAssignmentActivityController)
    .controller(ModalAssignmentController.__name, ModalAssignmentController)
    .controller(ModalDialogController.__name, ModalDialogController)
    .controller(ModalDocumentController.__name, ModalDocumentController)
    .controller(ModalProgressController.__name, ModalProgressController)
    .controller(ModalReminderController.__name, ModalReminderController)
    .controller(ModalTaskMigrateController.__name, ModalTaskMigrateController)
    .controller(ModalTaskController.__name, ModalTaskController);
});
