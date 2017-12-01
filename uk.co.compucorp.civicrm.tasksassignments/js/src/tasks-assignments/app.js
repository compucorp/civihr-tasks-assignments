/* global CustomEvent */
/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/modules/config',
  'tasks-assignments/modules/settings',
  'tasks-assignments/modules/run.module',
  'tasks-assignments/modules/app-dashboard.module',
  'tasks-assignments/modules/app-documents.module',
  'tasks-assignments/modules/app-tasks',
  'tasks-assignments/modules/app-settings',
  'tasks-assignments/controllers/controllers',
  'tasks-assignments/controllers/calendar.controller',
  'tasks-assignments/controllers/date-list.controller',
  'tasks-assignments/controllers/document-list.controller',
  'tasks-assignments/controllers/document.controller',
  'tasks-assignments/controllers/assignments.controller',
  'tasks-assignments/controllers/main.controller',
  'tasks-assignments/controllers/task-list.controller',
  'tasks-assignments/controllers/task.controller',
  'tasks-assignments/controllers/dashboard/nav-main.controller',
  'tasks-assignments/controllers/dashboard/top-bar.controller',
  'tasks-assignments/controllers/modal/modal-dialog.controller',
  'tasks-assignments/controllers/modal/modal-document.controller',
  'tasks-assignments/controllers/modal/modal-progress.controller',
  'tasks-assignments/controllers/modal/modal-task.controller',
  'tasks-assignments/controllers/modal/modal-task-migrate.controller',
  'tasks-assignments/controllers/modal/modal-reminder.controller',
  'tasks-assignments/controllers/modal/modal-assignment.controller',
  'tasks-assignments/controllers/external-page.controller',
  'tasks-assignments/controllers/settings.controller',
  'tasks-assignments/directives/directives',
  'tasks-assignments/directives/civi-events.directive',
  'tasks-assignments/directives/iframe.directive',
  'tasks-assignments/directives/sidebar-filters.directive',
  'tasks-assignments/directives/spinner.directive',
  'tasks-assignments/directives/validate.directive',
  'tasks-assignments/filters/filters',
  'tasks-assignments/filters/assignment-type',
  'tasks-assignments/filters/contact-id',
  'tasks-assignments/filters/date',
  'tasks-assignments/filters/date-parse',
  'tasks-assignments/filters/date-type',
  'tasks-assignments/filters/date-field.filter',
  'tasks-assignments/filters/offset',
  'tasks-assignments/filters/ownership',
  'tasks-assignments/filters/status',
  'tasks-assignments/services/services'
], function (angular) {
  'use strict';

  document.addEventListener('taInit', function (e) {
    angular.bootstrap(document.getElementById(e.detail.module), ['civitasks.' + e.detail.app]);
  });

  document.dispatchEvent(typeof window.CustomEvent === 'function' ? new CustomEvent('taReady') : (function () {
    var e = document.createEvent('Event');

    e.initEvent('taReady', true, true);

    return e;
  })());
});
