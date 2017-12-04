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
  'tasks-assignments/modules/controllers',
  'tasks-assignments/directives/directives',
  'tasks-assignments/directives/civi-events.directive',
  'tasks-assignments/directives/iframe.directive',
  'tasks-assignments/directives/sidebar-filters.directive',
  'tasks-assignments/directives/spinner.directive',
  'tasks-assignments/directives/validate.directive',
  'tasks-assignments/filters/filters',
  'tasks-assignments/filters/assignment-type.filter',
  'tasks-assignments/filters/contact-id.filter',
  'tasks-assignments/filters/date.filter',
  'tasks-assignments/filters/date-parse.filter',
  'tasks-assignments/filters/date-type.filter',
  'tasks-assignments/filters/date-field.filter',
  'tasks-assignments/filters/offset.filter',
  'tasks-assignments/filters/ownership.filter',
  'tasks-assignments/filters/status.filter',
  'tasks-assignments/services/services'
], function (angular) {
  'use strict';

  document.addEventListener('taInit', function (e) {
    angular.bootstrap(document.getElementById(e.detail.module), ['civitasks.' + e.detail.app]);
  });

  document.dispatchEvent(typeof window.CustomEvent === 'function' ? new window.CustomEvent('taReady') : (function () {
    var e = document.createEvent('Event');

    e.initEvent('taReady', true, true);

    return e;
  })());
});
