/* eslint-env amd */

define([
  'common/moment',
  'tasks-assignments/filters/filters'
], function (moment, filters) {
  'use strict';

  filters.filter('filterByDate', ['$filter', '$log', function ($filter, $log) {
    $log.debug('Filter: filterBy.date');

    return function (inputArr, type) {
      if (!inputArr || !inputArr.length || !type) {
        return [];
      }

      var filteredArr = [];
      var i = 0;
      var inputArrLen = inputArr.length;
      var startOfPeriod;
      var endOfPeriod;
      var testDate;

      startOfPeriod = moment().startOf(type);
      endOfPeriod = moment().endOf(type);

      for (; i < inputArrLen; i++) {
        testDate = moment(inputArr[i].date);
        if (testDate > startOfPeriod && testDate < endOfPeriod) {
          filteredArr.push(inputArr[i]);
        }
      }

      return filteredArr;
    };
  }]);
});
