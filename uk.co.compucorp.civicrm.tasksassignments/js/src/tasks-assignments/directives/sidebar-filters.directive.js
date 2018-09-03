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
      templateUrl: config.path.TPL + 'directives/sidebar-filters.html'
    };
  }

  return { sidebarFilters: sidebarFilters };
});
