/* eslint-env amd */

define([
  'tasks-assignments/filters/filters'
], function (filters) {
  'use strict';

  filters.filter('filterByStatus', ['$filter', '$rootScope', '$log', function ($filter, $rootScope, $log) {
    $log.debug('Filter: filterByStatus');

    return function (inputArr, statusArr, equal) {
      var filteredArr = [];
      var i = 0;
      var inputArrLen = inputArr.length;
      var statusArrLen = statusArr.length;

      equal = typeof equal !== 'undefined' ? equal : true;

      if (!inputArrLen || !statusArrLen) {
        return inputArr;
      }

      for (i; i < inputArrLen; i++) {
        if ((statusArr.indexOf(inputArr[i].status_id) !== -1) === equal) {
          filteredArr.push(inputArr[i]);
        }
      }

      return filteredArr;
    };
  }]);
});
