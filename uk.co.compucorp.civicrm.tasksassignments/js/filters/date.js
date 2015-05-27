define(['filters/filters'], function(filters){
    filters.filter('filterBy.date',['$filter', '$log', function($filter, $log){
        $log.debug('Filter: filterBy.date');

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
                case 'dateRange':

                    if (!dateRange || typeof dateRange !== 'object') {
                        return inputArr;
                    }

                    var itemDateTime,
                        filterDateTimeFrom = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : -Infinity,
                        filterDateTimeUntil = dateRange.until ? new Date(dateRange.until).setHours(0, 0, 0, 0) : Infinity;

                    for (i; i < inputArrlen; i++) {
                        itemDateTime = new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0);
                        if (itemDateTime >= filterDateTimeFrom && itemDateTime <= filterDateTimeUntil) {
                            filteredArr.push(inputArr[i]);
                        }
                    }

                    break;

                case 'month':
                    for (i; i < inputArrlen; i++) {
                        if (new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) == today) {
                            filteredArr.push(inputArr[i]);
                        }
                    }
                    break;

                case 'year':
                    for (i; i < inputArrlen; i++) {
                        if (new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0) < today) {
                            filteredArr.push(inputArr[i]);
                        }
                    }
                    break;

                case 'week':
                    var d = new Date(),
                        day = d.getDay(),
                        diff = d.getDate() - day + (day == 0 ? -6:1),
                        mon = new Date(d.setDate(diff)),
                        sun = new Date(d.setDate(mon.getDate()+7)),
                        itemDateTime;

                    for (i; i < inputArrlen; i++) {
                        itemDateTime = new Date(inputArr[i].activity_date_time).setHours(0, 0, 0, 0)

                        if (itemDateTime >= mon.setHours(0, 0, 0, 0) && itemDateTime < sun.setHours(0, 0, 0, 0)) {
                            filteredArr.push(inputArr[i]);
                        }
                    }
                    break;
            }

            return filteredArr;
        }
    }]);

});