/* eslint-env amd */

define([
  'common/angular',
  'tasks-assignments/directives/civi-events.directive',
  'tasks-assignments/directives/iframe.directive',
  'tasks-assignments/directives/sidebar-filters.directive',
  'tasks-assignments/directives/spinner.directive',
  'tasks-assignments/directives/validate.directive'
], function (angular, ctCiviEvents, taIframe, sidebarFilters, ctSpinner, taValidate) {
  'use strict';

  return angular.module('tasks-assignments.directives', [])
    .directive(ctCiviEvents)
    .directive(taIframe)
    .directive(sidebarFilters)
    .directive(ctSpinner)
    .directive(taValidate);
});
