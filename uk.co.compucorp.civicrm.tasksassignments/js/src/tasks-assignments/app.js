/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/modules/task-assignments.constants',
  'tasks-assignments/modules/task-assignments.values',
  'tasks-assignments/modules/task-assignments.run',
  'tasks-assignments/modules/task-assignments.dashboard.module',
  'tasks-assignments/modules/task-assignments.documents.module',
  'tasks-assignments/modules/task-assignments.tasks.module',
  'tasks-assignments/modules/task-assignments.settings.module',
  'tasks-assignments/modules/task-assignments.controllers',
  'tasks-assignments/modules/task-assignments.directives',
  'tasks-assignments/modules/task-assignments.filters',
  'tasks-assignments/modules/task-assignments.resources',
  'tasks-assignments/modules/task-assignments.services'
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
