define([
    'tasks-assignments/filters/filters'
], function (filters) {
    'use strict';

    filters.filter('filterBy.dateType',['$filter', '$rootScope', '$log', function ($filter, $rootScope, $log) {
        $log.debug('Filter: filterBy.dateType');

        return function(inputArr, dateTypeArr) {
            var filteredArr = [],
                i = 0,
                ii,
                inputArrLen = inputArr.length,
                dateTypeArrLen = dateTypeArr.length,
                dateContactList,
                dateContactListLen;

            if (!inputArrLen || !dateTypeArrLen) {
                return inputArr;
            }

            for (i; i < inputArrLen; i++) {
                ii = 0,
                dateContactList = inputArr[i].dateContactList,
                dateContactListLen = dateContactList.length;

                for (ii; ii < dateContactListLen; ii++) {
                    if (dateTypeArr.indexOf(dateContactList[ii].type) !== -1) {
                        filteredArr.push(inputArr[i]);
                        break;
                    }
                }
            }

            return filteredArr;
        }
    }]);
});
