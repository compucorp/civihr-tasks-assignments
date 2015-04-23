define(['filters/filters',
        'moment'], function(filters, moment){
    filters.filter('dateParse',['$filter','$log', function($filter, $log){
        $log.debug('Filter: dateParse');

        return function(input) {
            return moment(input).toDate();
        }
    }]);
});