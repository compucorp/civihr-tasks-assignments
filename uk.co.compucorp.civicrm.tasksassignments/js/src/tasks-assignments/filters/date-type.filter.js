/* eslint-env amd */

define(function () {
  'use strict';

  filterByDateType.__name = 'filterByDateType';
  filterByDateType.$inject = ['$filter', '$rootScope', '$log'];

  function filterByDateType ($filter, $rootScope, $log) {
    $log.debug('Filter: filterBy.dateType');

    return function (inputArr, dateTypeArr) {
      var filteredArr = [];
      var i = 0;
      var ii;
      var inputArrLen = inputArr.length;
      var dateTypeArrLen = dateTypeArr.length;
      var dateContactList;
      var dateContactListLen;

      if (!inputArrLen || !dateTypeArrLen) {
        return inputArr;
      }

      for (i; i < inputArrLen; i++) {
        ii = 0;
        dateContactList = inputArr[i].dateContactList;
        dateContactListLen = dateContactList.length;

        for (ii; ii < dateContactListLen; ii++) {
          if (dateTypeArr.indexOf(dateContactList[ii].type) !== -1) {
            filteredArr.push(inputArr[i]);
            break;
          }
        }
      }

      return filteredArr;
    };
  }

  return filterByDateType;
});
