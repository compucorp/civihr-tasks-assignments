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
], function (angular, AssignmentsCtrl, CalendarCtrl, DateListCtrl, DocumentListController,
  DocumentCtrl, ExternalPageCtrl, MainCtrl, SettingsCtrl, TaskListController,
  TaskCtrl, NavMainCtrl, TopBarCtrl, ModalAssignmentActivityCtrl, ModalAssignmentCtrl,
  ModalDialogCtrl, ModalDocumentController, ModalProgressCtrl, ModalReminderCtrl,
  ModalTaskMigrateCtrl, ModalTaskCtrl) {
  'use strict';

  return angular.module('task-assignments.controllers', [])
    .controller(AssignmentsCtrl.__name, AssignmentsCtrl)
    .controller(CalendarCtrl.__name, CalendarCtrl)
    .controller(DateListCtrl.__name, DateListCtrl)
    .controller(DocumentListController.__name, DocumentListController)
    .controller(DocumentCtrl.__name, DocumentCtrl)
    .controller(ExternalPageCtrl.__name, ExternalPageCtrl)
    .controller(MainCtrl.__name, MainCtrl)
    .controller(SettingsCtrl.__name, SettingsCtrl)
    .controller(TaskListController.__name, TaskListController)
    .controller(TaskCtrl.__name, TaskCtrl)
    .controller(NavMainCtrl.__name, NavMainCtrl)
    .controller(TopBarCtrl.__name, TopBarCtrl)
    .controller(ModalAssignmentActivityCtrl.__name, ModalAssignmentActivityCtrl)
    .controller(ModalAssignmentCtrl.__name, ModalAssignmentCtrl)
    .controller(ModalDialogCtrl.__name, ModalDialogCtrl)
    .controller(ModalDocumentController.__name, ModalDocumentController)
    .controller(ModalProgressCtrl.__name, ModalProgressCtrl)
    .controller(ModalReminderCtrl.__name, ModalReminderCtrl)
    .controller(ModalTaskMigrateCtrl.__name, ModalTaskMigrateCtrl)
    .controller(ModalTaskCtrl.__name, ModalTaskCtrl);
});
