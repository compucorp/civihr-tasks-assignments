define(['services/services',
        'services/utils'], function (services) {

    services.factory('ContactService', ['$resource', 'settings', '$q', 'UtilsService','$log',
        function ($resource, settings, $q, UtilsService, $log) {
            $log.debug('Service: ContactService');

        var Contact = $resource(settings.pathRest, {
            action: 'get',
            entity: 'contact',
            json: {}
        });

        return {
            get: function(id) {

                if (!id || (typeof +id !== 'number' && typeof id !== 'object') ) {
                    return null
                }

                var deferred = $q.defer();

                Contact.get({json: {
                    'id': id,
                    'debug': settings.debug
                }}, function(data){

                    if (UtilsService.errorHandler(data,'Unable to fetch contacts',deferred)) {
                        return
                    }

                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to fetch contact');
                });

                return deferred.promise;
            },
            search: function(input, params){

                if ((!input || typeof input === 'undefined') ||
                    (params && typeof params !== 'object')) {
                    return null
                }

                var deferred = $q.defer(),
                    params = params || {};

                Contact.get({
                    action: 'getlist',
                    json: {
                        input: input,
                        params: params,
                        debug: settings.debug
                }}, function(data){

                    if (UtilsService.errorHandler(data,'Unable to fetch contact list',deferred)) {
                        return
                    }

                    deferred.resolve(data.values);

                },function(){
                    deferred.reject('Unable to fetch contact list');
                });

                return deferred.promise;
            }
        }

    }]);

});