define([
    'tasks-assignments/filters/filters'
], function (filters) {
    'use strict';

    filters.filter('offset',['$log', function ($log) {
        $log.debug('Filter: offset');

        return function(inputArr, start) {
            start = start || 0;
            return inputArr.slice(parseInt(start, 10));
        }
    }]);
});
