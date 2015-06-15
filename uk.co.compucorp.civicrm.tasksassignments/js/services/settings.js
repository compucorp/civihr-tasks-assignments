define(['services/services',
        'services/utils'], function (services) {

    services.factory('Settings',['$resource', 'config', '$log', function($resource, config, $log){
        $log.debug('Service: Settings');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'TASettings',
            'fields': {}
        });

    }]);

    services.factory('SettingsService',['Settings', '$q', 'config', 'UtilsService', '$log',
        function(Task, $q, config, UtilsService, $log){
        $log.debug('Service: SettingsService');

        return {
            get: function(params){
                var deferred = $q.defer();

                params = params && typeof params === 'object' ? params : [];

                Task.get({fields: params}, function(data){
                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to fetch the settings');
                });

                return deferred.promise;
            },
            set: function(fields){

                if (!fields || typeof fields !== 'object') {
                    return null;
                }

                var deferred = $q.defer(),
                    params = angular.extend({
                        sequential: 1,
                        debug: config.DEBUG
                    },fields),
                    val;

                Task.save({
                    action: 'set',
                    fields: params
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to save',deferred)) {
                        return
                    }

                    val = data.values;
                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to save');
                });

                return deferred.promise;
            }
        }

    }]);

});