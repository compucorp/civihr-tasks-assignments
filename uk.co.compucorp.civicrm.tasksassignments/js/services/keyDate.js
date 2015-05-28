+define(['services/services',
        'moment',
        'services/utils'], function (services, moment) {

    services.factory('KeyDate',['$resource', 'config', '$log', function($resource, config, $log){
        $log.debug('Service: KeyDate');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'KeyDates',
            'json': {}
        });

    }]);

    services.factory('KeyDateService',['KeyDate', '$q', 'config', 'UtilsService', '$log',
        function(KeyDate, $q, config, UtilsService, $log){
        $log.debug('Service: KeyDateService');

        return {
            get: function(dateStart, dateEnd){
                var deferred = $q.defer();

                if (!dateStart || !dateEnd) {
                    return null;
                }

                dateStart = dateStart ? moment(dateStart).format('YYYY-MM-DD') : null;
                dateEnd = dateEnd ? moment(dateEnd).format('YYYY-MM-DD') : null;

                KeyDate.get({ json: {
                    'start_date': dateStart,
                    'end_date': dateEnd
                }}, function(data){
                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to fetch documents list');
                });

                return deferred.promise;
            }
        }

    }]);

});