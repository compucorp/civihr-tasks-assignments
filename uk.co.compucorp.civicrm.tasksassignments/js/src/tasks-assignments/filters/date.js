define([
    'common/moment',
    'tasks-assignments/filters/filters'
], function (moment, filters) {
    'use strict';

    filters.filter('filterBy.date',['$filter', '$log', function ($filter, $log) {
        $log.debug('Filter: filterBy.date');

        return function(inputArr, type) {

            if (!inputArr || !inputArr.length || !type) {
                return [];
            }

            var filteredArr = [],
                i = 0,
                inputArrLen = inputArr.length,
                startOfPeriod,
                endOfPeriod,
                testDate;

            startOfPeriod = moment().startOf(type);
            endOfPeriod = moment().endOf(type);

            for (; i < inputArrLen; i++) {
                testDate = moment(inputArr[i].date);
                if (testDate > startOfPeriod && testDate < endOfPeriod) {
                    filteredArr.push(inputArr[i]);
                }
            }

            return filteredArr;
        }
    }]);

});
