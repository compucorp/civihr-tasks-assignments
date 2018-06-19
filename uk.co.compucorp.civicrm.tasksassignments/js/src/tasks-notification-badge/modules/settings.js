/* eslint-env amd */

(function (CRM) {
  define([
    'common/angular'
  ], function (angular) {
    return angular.module('tasks-notification-badge.settings', []).constant('settings', {
      debug: CRM.debug,
      pathTpl: CRM.tasksAssignments.extensionPath + '/views/tasks-notification-badge/'
    });
  });
})(CRM);
