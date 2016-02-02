define([
    'tasks-assignments/filters/filters'
], function (filters) {
    'use strict';

    filters.filter('filterBy.status',['$filter', '$rootScope', '$log', function ($filter, $rootScope, $log) {
        $log.debug('Filter: filterBy.status');

        return function(inputArr, statusArr, equal) {
            var filteredArr = [],
                i = 0,
                inputArrLen = inputArr.length,
                statusArrLen = statusArr.length,
                equal = typeof equal !== 'undefined' ? equal : true;

            if (!inputArrLen || !statusArrLen) {
                return inputArr;
            }

            for (i; i < inputArrLen; i++) {
                if ((statusArr.indexOf(inputArr[i].status_id) !== -1) == equal) {
                    filteredArr.push(inputArr[i]);
                }
            }

            return filteredArr;
        }
    }]);
});
