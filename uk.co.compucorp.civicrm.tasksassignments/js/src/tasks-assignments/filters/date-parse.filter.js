/* eslint-env amd */

define([
  'common/moment',
  'tasks-assignments/filters/filters'
], function (moment, filters) {
  'use strict';

  filters.filter('dateParse', ['$filter', '$log', function ($filter, $log) {
    $log.debug('Filter: dateParse');

    return function (input) {
      return moment(input).toDate();
    };
  }]);
});
