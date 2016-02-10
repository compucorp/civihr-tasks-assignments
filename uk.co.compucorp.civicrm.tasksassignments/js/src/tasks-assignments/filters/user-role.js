define([
    'tasks-assignments/filters/filters'
], function (filters) {
    'use strict';

    filters.filter('filterByUserRole',['$filter', 'config', '$log', function($filter, config, $log){
        $log.debug('Filter: filterByUserRole');

        return function(inputArr, contactTypeField, equal) {
            var filteredArr = [],
                i = 0,
                inputArrlen = inputArr.length,
                equal = typeof equal !== 'undefined' ? equal : true;

            if (!inputArrlen || !contactTypeField) {
                return inputArr;
            }

            for (i; i < inputArrlen; i++) {
                if ((inputArr[i][contactTypeField] == config.LOGGED_IN_CONTACT_ID) == equal) {
                    filteredArr.push(inputArr[i]);
                }
            }
            return filteredArr;

        }
    }]);

});
