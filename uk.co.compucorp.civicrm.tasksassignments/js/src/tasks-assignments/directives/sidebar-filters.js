define([
  'tasks-assignments/directives/directives'
], function (directives) {
  'use strict';

  directives.directive('sidebarFilters', ['$log', 'config', function ($log, config) {
    $log.debug('Directive: sidebarFilters');

    return {
      restrict: 'E',
      scope: true,
      transclude: true,
      templateUrl: config.path.TPL + 'directives/sidebar-filters.html',
      controller: ['$scope', function ($scope) {
        $scope.dueFilters = [
          { badgeClass: 'danger', calendarView: 'month', value: 'overdue' },
          { badgeClass: 'primary', calendarView: 'day', value: 'dueToday' },
          { badgeClass: 'primary', calendarView: 'week', value: 'dueThisWeek' }
        ];
      }]
    };
  }]);
});
