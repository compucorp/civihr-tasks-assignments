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
    'tasks-assignments/dashboard/tasks-assignments.dashboard.module',
    'tasks-assignments/modules/tasks-assignments.documents.module',
    'tasks-assignments/settings/tasks-assignments.settings.module',
    'tasks-assignments/tasks/tasks-assignments.tasks.module'
  ], function (angular) {
    'use strict';

    document.addEventListener('taInit', function (e) {
      var appRootElement = angular.element(document.getElementById(e.detail.module));
      var isBootstrapped = !!appRootElement.injector();

      if (!isBootstrapped) {
        angular.bootstrap(appRootElement, ['tasks-assignments.' + e.detail.app]);
      }
    });

    document.dispatchEvent(typeof window.CustomEvent === 'function' ? new window.CustomEvent('taReady') : (function () {
      var e = document.createEvent('Event');
      e.initEvent('taReady', true, true);

      return e;
    })());
  });
})(require);
