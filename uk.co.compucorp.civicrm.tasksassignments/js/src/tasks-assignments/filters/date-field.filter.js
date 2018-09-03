/* eslint-env amd */

define(function () {
  'use strict';

  filterByDateField.$inject = ['$filter', '$log'];

  function filterByDateField ($filter, $log) {
    $log.debug('Filter: filterByDateField');

    return function (inputArr, type, field, dateRange) {
      if (!inputArr) {
        return null;
      }

      var date = new Date();
      var filteredArr = [];
      var i = 0;
      var inputArrlen = inputArr.length;
      var today = date.setHours(0, 0, 0, 0);

      if (!field) {
        throw new Error('Field name to filter a list is required');
      }

      if (!inputArrlen || !type) {
        return inputArr;
      }

      switch (type) {
        case 'overdue':
          var itemDueDate;

          for (i; i < inputArrlen; i++) {
            itemDueDate = null;
            if (inputArr[i][field]) {
              itemDueDate = new Date(inputArr[i][field]).setHours(0, 0, 0, 0);
            }

            if (itemDueDate < today && itemDueDate !== null) {
              filteredArr.push(inputArr[i]);
            }
          }
          break;
        case 'dateRange':
          if (!dateRange || typeof dateRange !== 'object') {
            return inputArr;
          }

          var itemDateTime;
          var filterDateTimeFrom = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : null;
          var filterDateTimeUntil = dateRange.until ? new Date(dateRange.until).setHours(0, 0, 0, 0) : null;

          for (i; i < inputArrlen; i++) {
            itemDateTime = inputArr[i][field] ? new Date(inputArr[i][field]).setHours(0, 0, 0, 0) : null;

            if (isDateBetweenTwoDates(itemDateTime, filterDateTimeFrom, filterDateTimeUntil)) {
              filteredArr.push(inputArr[i]);
            }
          }
          break;
        case 'dueToday':
          for (i; i < inputArrlen; i++) {
            if (new Date(inputArr[i][field]).setHours(0, 0, 0, 0) === today) {
              filteredArr.push(inputArr[i]);
            }
          }
          break;
        case 'dueThisWeek':
          var d = new Date();
          var day = d.getDay();
          var diff = d.getDate() - day + (day === 0 ? -6 : 1);
          var mon = new Date(d.setDate(diff));
          var sun = new Date(d.setDate(mon.getDate() + 7));

          for (i; i < inputArrlen; i++) {
            itemDateTime = new Date(inputArr[i][field]).setHours(0, 0, 0, 0);

            if (itemDateTime > today && itemDateTime >= mon.setHours(0, 0, 0, 0) && itemDateTime < sun.setHours(0, 0, 0, 0)) {
              filteredArr.push(inputArr[i]);
            }
          }
          break;
        case 'dueInNextFortnight':
          var fortNight = date.setDate(date.getDate() + 14);

          for (i; i < inputArrlen; i++) {
            if (new Date(inputArr[i][field]).setHours(0, 0, 0, 0) >= today &&
              new Date(inputArr[i][field]).setHours(0, 0, 0, 0) <= fortNight) {
              filteredArr.push(inputArr[i]);
            }
          }
          break;
        case 'dueInNinetyDays':
          var ninetyDays = date.setDate(date.getDate() + 90);

          for (i; i < inputArrlen; i++) {
            if (new Date(inputArr[i][field]).setHours(0, 0, 0, 0) >= today &&
              new Date(inputArr[i][field]).setHours(0, 0, 0, 0) <= ninetyDays) {
              filteredArr.push(inputArr[i]);
            }
          }
          break;
      }

      return filteredArr;
    };

    /**
     * Validates if the target date resides
     * between two other dates
     *
     * @param targetDate
     * @param fromDate
     * @param toDate
     *
     * @return {boolean}
     */
    function isDateBetweenTwoDates (targetDate, fromDate, toDate) {
      return (
        targetDate !== null &&
        targetDate >= fromDate &&
        (targetDate <= toDate || toDate === null)
      ) ||
      (
        targetDate === null &&
        toDate === null
      );
    }
  }

  return { filterByDateField: filterByDateField };
});
