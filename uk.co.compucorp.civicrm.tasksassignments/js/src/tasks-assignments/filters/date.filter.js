/* eslint-env amd */

define([
  'common/moment'
], function (moment) {
  'use strict';

  filterByDate.$inject = ['$filter', '$log'];

  function filterByDate ($filter, $log) {
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
  }

  return { filterByDate: filterByDate };
});
