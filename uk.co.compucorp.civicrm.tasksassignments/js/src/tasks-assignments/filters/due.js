define([
  'tasks-assignments/filters/filters'
], function (filters) {
  'use strict';

  filters.filter('filterByDue',['$filter', '$log', function($filter, $log){
    $log.debug('Filter: filterByDue');

    return function(inputArr, type, dateRange) {

      if (!inputArr) {
        return null;
      }

      var filteredArr = [],
        i = 0,
        inputArrlen = inputArr.length,
        date = new Date(),
        today = date.setHours(0, 0, 0, 0);

      if (!inputArrlen || !type) {
        return inputArr;
      }

      switch(type){
        case 'overdue':
          for (i; i < inputArrlen; i++) {
            itemDueDate = null;
            if (inputArr[i].activity_date_time) {
              itemDueDate = new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0);
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

          var itemDateTime,
            filterDateTimeFrom = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : null,
            filterDateTimeUntil = dateRange.until ? new Date(dateRange.until).setHours(0, 0, 0, 0) : null;

          for (i; i < inputArrlen; i++) {
            itemDateTime = inputArr[i].activity_date_time ? new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) : null;

            if (isDateBetweenTwoDates(itemDateTime, filterDateTimeFrom, filterDateTimeUntil)) {
              filteredArr.push(inputArr[i]);
            }
          }

          break;
        case 'dueToday':
          for (i; i < inputArrlen; i++) {
            if (new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) == today) {
              filteredArr.push(inputArr[i]);
            }
          }
          break;

        case 'dueThisWeek':
          var d = new Date(),
            day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6:1),
            mon = new Date(d.setDate(diff)),
            sun = new Date(d.setDate(mon.getDate()+7)),
            itemDateTime;

          for (i; i < inputArrlen; i++) {
            itemDateTime = new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0);

            if (itemDateTime > today && itemDateTime >= mon.setHours(0, 0, 0, 0) && itemDateTime < sun.setHours(0, 0, 0, 0)) {
              filteredArr.push(inputArr[i]);
            }
          }
          break;

        case 'dueInNextFortnight':
          var fortNight = date.setDate(date.getDate() + 14);

          for (i; i < inputArrlen; i++) {
            if (new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) >= today &&
              new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) <= fortNight) {
              filteredArr.push(inputArr[i]);
            }
          }
          break;
        case 'dueInNinetyDays':
          var ninetyDays = date.setDate(date.getDate() + 90);

          for (i; i < inputArrlen; i++) {
            if (new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) >= today &&
              new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) <= ninetyDays) {
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
    function isDateBetweenTwoDates(targetDate, fromDate, toDate) {
      return (
        targetDate !== null
        && targetDate >= fromDate
        && (targetDate <= toDate || toDate === null)
      )
      ||
      (
        targetDate === null
        && toDate === null
      )
    }
  }]);

});
