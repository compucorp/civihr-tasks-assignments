/* eslint-env amd */

(function () {
  var extPath = CRM.tasksAssignments.extensionPath + 'js/src/tasks-assignments';

  require.config({
    urlArgs: 'bust=' + (new Date()).getTime(),
    paths: {
      'tasks-assignments': extPath,
      'tasks-assignments/vendor/angular-bootstrap-calendar': extPath + '/vendor/angular/angular-bootstrap-calendar-tpls-custom',
      'tasks-assignments/vendor/angular-checklist-model': extPath + '/vendor/angular/checklist-model',
      'tasks-assignments/vendor/angular-router': extPath + '/vendor/angular/angular-ui-router'
    }
  });

  require([
    'common/angular',
    'tasks-assignments/modules/tasks-assignments.dashboard.module',
    'tasks-assignments/modules/tasks-assignments.documents.module',
    'tasks-assignments/modules/tasks-assignments.settings.module',
    'tasks-assignments/modules/tasks-assignments.tasks.module'
  ], function (angular) {
    'use strict';

    document.addEventListener('taInit', function (e) {
      angular.bootstrap(document.getElementById(e.detail.module), ['tasks-assignments.' + e.detail.app]);
    });

    document.dispatchEvent(typeof window.CustomEvent === 'function' ? new window.CustomEvent('taReady') : (function () {
      var e = document.createEvent('Event');
      e.initEvent('taReady', true, true);

      return e;
    })());
  });
})(require);
