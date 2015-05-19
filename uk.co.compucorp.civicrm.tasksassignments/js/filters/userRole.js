define(['filters/filters'], function(filters){
    filters.filter('filterBy.userRole',['$filter', 'config', '$log', function($filter, config, $log){
        $log.debug('Filter: filterBy.userRole');

        return function(inputArr, contactTypeField) {
            var filteredArr = [],
                i = 0,
                inputArrlen = inputArr.length;

            if (!inputArrlen || !contactTypeField) {
                return inputArr;
            }

            for (i; i < inputArrlen; i++) {
                if (inputArr[i][contactTypeField] == config.LOGGED_IN_CONTACT_ID) {
                    filteredArr.push(inputArr[i]);
                }
            }
            return filteredArr;

        }
    }]);

});