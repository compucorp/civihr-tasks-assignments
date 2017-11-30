/* eslint-env amd */

define(function () {
  'use strict';

  filterByDateType.__name = 'filterByDateType';
  filterByDateType.$inject = ['$filter', '$rootScope', '$log'];

  function filterByDateType ($filter, $rootScope, $log) {
    $log.debug('Filter: filterBy.dateType');

    return function(dateContactList, dateTypeList) {
      var filteredDateContactList = [];

      if (!dateContactList.length || !dateTypeList.length) {
        return dateContactList;
      }

      _.forEach(dateContactList, function (dateContact) {
        var dateContactList = dateContact.dateContactList;

        dateContactList && _.forEach(dateContactList, function (singleDateContact) {
          if (dateTypeList.indexOf(singleDateContact.type) !== -1) {
            return filteredDateContactList.push(dateContact);
          }
        });

        if (dateTypeList.indexOf(dateContact.type) !== -1) {
          return filteredDateContactList.push(dateContact);
        }
      });

      return filteredDateContactList;
    }
  }

  return filterByDateType;
});
