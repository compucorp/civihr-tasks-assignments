/* eslint-env amd */

define([
  'common/lodash'
], function (_) {
  'use strict';

  filterByDateType.__name = 'filterByDateType';
  filterByDateType.$inject = ['$filter', '$rootScope', '$log'];

  function filterByDateType ($filter, $rootScope, $log) {
    $log.debug('Filter: filterBy.dateType');

    /**
     * Filters the array of key dates in both cases
     * case 1: when the input array contains key dates in dateContactList propery
     * case 2: when the input array is itself is a list of key dates list.
     *
     * @param  {Array} dateContactList List of contact key dates
     * @param  {Array} dateTypeList list of date types
     * @return {Array}
     */
    return function (dateContactList, dateTypeList) {
      var filteredDateContactList = [];

      if (!dateContactList.length || !dateTypeList.length) {
        return dateContactList;
      }

      _.forEach(dateContactList, function (contactKeyDate) {
        var nestedKeyDates = contactKeyDate.dateContactList;

        if (nestedKeyDates) {
          _.forEach(nestedKeyDates, function (singleKeyDate) {
            if (dateTypeList.indexOf(singleKeyDate.type) !== -1) {
              filteredDateContactList.push(contactKeyDate);

              return false; // break loop
            }
          });
        } else {
          if (dateTypeList.indexOf(contactKeyDate.type) !== -1) {
            filteredDateContactList.push(contactKeyDate);
          }
        }
      });

      return filteredDateContactList;
    };
  }

  return filterByDateType;
});
