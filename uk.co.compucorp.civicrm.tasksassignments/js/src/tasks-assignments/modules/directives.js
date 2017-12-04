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

  return angular.module('civitasks.directives', [])
    .directive(ctCiviEvents.__name, ctCiviEvents)
    .directive(taIframe.__name, taIframe)
    .directive(sidebarFilters.__name, sidebarFilters)
    .directive(ctSpinner.__name, ctSpinner)
    .directive(taValidate.__name, taValidate);
});
