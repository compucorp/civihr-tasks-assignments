define(['filters/filters'], function(filters){
    filters.filter('filterBy.status',['$filter', '$rootScope', '$log', function($filter, $rootScope, $log){
        $log.debug('Filter: filterBy.status');

        return function(inputArr, statusArr) {
            var filteredArr = [],
                i = 0,
                inputArrLen = inputArr.length,
                statusArrLen = statusArr.length;

            if (!inputArrLen || !statusArrLen) {
                return inputArr;
            }

            for (i; i < inputArrLen; i++) {
                if (statusArr.indexOf(inputArr[i].status_id) !== -1) {
                    filteredArr.push(inputArr[i]);
                }
            }

            return filteredArr;
        }
    }]);
});