/* eslint-env amd */

define(function () {
  'use strict';

  sidebarFilters.$inject = ['$log', 'config'];

  function sidebarFilters ($log, config) {
    $log.debug('Directive: sidebarFilters');

    return {
      restrict: 'E',
      scope: true,
      transclude: true,
      templateUrl: config.path.EXT + 'js/src/tasks-assignments/directives/sidebar-filters.html'
    };
  }

  return { sidebarFilters: sidebarFilters };
});
