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
  'tasks-assignments/modules/directives',
  'tasks-assignments/modules/filters',
  'tasks-assignments/modules/resources',
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
