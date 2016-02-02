define([
    'tasks-assignments/filters/filters'
], function (filters) {
    'use strict';

    filters.filter('filterBy.assignmentType',['$filter', '$rootScope', '$log', function ($filter, $rootScope, $log) {
        $log.debug('Filter: filterBy.assignmentType');

        return function(inputArr, assignmentTypeArr) {
            var assignment,
                assignmentCacheObj = $rootScope.cache.assignment.obj,
                assignmentTypeArrLen = assignmentTypeArr.length,
                filteredArr = [],
                i = 0,
                inputArrlen = inputArr.length;

            if (!inputArrlen || !assignmentTypeArrLen) {
                return inputArr;
            }

            for (i; i < inputArrlen; i++) {
                assignment = assignmentCacheObj[inputArr[i].case_id];
                if (assignment &&
                    assignmentTypeArr.indexOf(assignment.case_type_id) !== -1) {
                    filteredArr.push(inputArr[i]);
                }
            }

            return filteredArr;
        }
    }]);
});
