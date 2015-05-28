define(['filters/filters','moment'], function(filters, moment){
    filters.filter('filterBy.date',['$filter', '$log', function($filter, $log){
        $log.debug('Filter: filterBy.date');

        return function(inputArr, type, dateRange) {

            if (!inputArr || !inputArr.length || !type) {
                return [];
            }

            var filteredArr = [],
                i = 0,
                inputArrLen = inputArr.length,
                startOfPeriod,
                endOfPeriod,
                testDate;

            if (type == 'dateRange') {
                return inputArr;
            }

            startOfPeriod = moment().startOf(type);
            endOfPeriod = moment().endOf(type);

            for (; i < inputArrLen; i++) {
                testDate = moment(inputArr[i].date);
                if (testDate > startOfPeriod && testDate < endOfPeriod) {
                    filteredArr.push(inputArr[i]);
                }
            }
/*

            switch(type){
                case 'dateRange':

                    if (!dateRange || typeof dateRange !== 'object') {
                        return inputArr;
                    }

                    var itemDateTime,
                        filterDateTimeFrom = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : -Infinity,
                        filterDateTimeUntil = dateRange.until ? new Date(dateRange.until).setHours(0, 0, 0, 0) : Infinity;

                    for (i; i < inputArrLen; i++) {
                        itemDateTime = new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0);
                        if (itemDateTime >= filterDateTimeFrom && itemDateTime <= filterDateTimeUntil) {
                            filteredArr.push(inputArr[i]);
                        }
                    }

                    break;

                case 'month':
                    var startOfMonth = moment().startOf('month'),
                        endOfMonth = moment().endOf('month');

                    for (; i < inputArrLen; i++) {
                        testDate = moment(inputArr[i].date);
                        if (testDate > startOfMonth && testDate < endOfMonth) {
                            filteredArr.push(inputArr[i]);
                        }
                    }

                    break;

                case 'year':
                    var startOfYear = moment().startOf('year'),
                        endOfYear = moment().endOf('year');

                    for (date in inputArr) {
                        testDate = moment(date);
                        if (testDate > startOfYear && testDate < endOfYear) {
                            filteredArr[date] = inputArr[date];
                        }
                    }

                    break;

                case 'week':
                    var startOfWeek = moment().startOf('isoWeek'),
                        endOfWeek = moment().endOf('isoWeek');

                    for (date in inputArr) {
                        testDate = moment(date);
                        if (testDate > startOfWeek && testDate < endOfWeek) {
                            filteredArr[date] = inputArr[date];
                        }
                    }

                    break;
            }
*/
            return filteredArr;
        }
    }]);

});