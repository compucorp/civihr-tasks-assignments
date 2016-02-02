define([
    'tasks-assignments/filters/filters'
], function (filters) {
    'use strict';

    filters.filter('filterBy.due',['$filter', '$log', function($filter, $log){
        $log.debug('Filter: filterBy.due');

        return function(inputArr, type, dateRange) {

            if (!inputArr) {
                return null;
            }

            var filteredArr = [],
                i = 0,
                inputArrlen = inputArr.length,
                today = new Date().setHours(0, 0, 0, 0);

            if (!inputArrlen || !type) {
                return inputArr;
            }

            switch(type){
                case 'overdue':
                    for (i; i < inputArrlen; i++) {
                        if (new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) < today ||
                           (inputArr[i].expire_date && new Date(inputArr[i].expire_date).setHours(0, 0, 0, 0) < today)) {
                            filteredArr.push(inputArr[i]);
                        }
                    }
                    break;

                case 'dateRange':

                    if (!dateRange || typeof dateRange !== 'object') {
                        return inputArr;
                    }

                    var itemDateTime,
                        itemDateExp,
                        filterDateTimeFrom = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : -Infinity,
                        filterDateTimeUntil = dateRange.until ? new Date(dateRange.until).setHours(0, 0, 0, 0) : Infinity;

                    for (i; i < inputArrlen; i++) {
                        itemDateTime = new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0);
                        itemDateExp = inputArr[i].expire_date ? new Date(inputArr[i].expire_date).setHours(0, 0, 0, 0) : false;

                        if ((itemDateTime >= filterDateTimeFrom && itemDateTime <= filterDateTimeUntil) ||
                            (itemDateExp && itemDateExp >= filterDateTimeFrom && itemDateExp <= filterDateTimeUntil)) {
                            filteredArr.push(inputArr[i]);
                        }
                    }

                    break;
                case 'dueToday':
                    for (i; i < inputArrlen; i++) {
                        if (new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) == today ||
                           (inputArr[i].expire_date && new Date(inputArr[i].expire_date).setHours(0, 0, 0, 0) == today)) {
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
                        itemDateTime,
                        itemDateExp;

                    for (i; i < inputArrlen; i++) {
                        itemDateTime = new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0);
                        itemDateExp = inputArr[i].expire_date ? new Date(inputArr[i].expire_date).setHours(0, 0, 0, 0) : false;

                        if ((itemDateTime >= mon.setHours(0, 0, 0, 0) && itemDateTime < sun.setHours(0, 0, 0, 0)) ||
                            (itemDateExp && itemDateExp >= mon.setHours(0, 0, 0, 0) && itemDateExp < sun.setHours(0, 0, 0, 0))) {
                            filteredArr.push(inputArr[i]);
                        }
                    }
                    break;
            }

            return filteredArr;
        }
    }]);

});
