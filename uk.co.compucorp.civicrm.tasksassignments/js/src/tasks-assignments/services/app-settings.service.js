/* eslint-env amd */

define(function () {
  'use strict';

  appsettingsService.__name = 'appsettingsService';
  appsettingsService.$inject = [
    'AppSettings', '$q', 'config', 'utilsService', '$log'
  ];

  function appsettingsService (AppSettings, $q, config, utilsService, $log) {
    $log.debug('Service: appsettingsService');

    return {

      /**
       * Get app setting form backend using Setting Entity
       *
       * @param  {array} fields
       * @return {promise}
       */
      get: function (fields) {
        var deferred = $q.defer();

        fields = fields && typeof fields === 'object' ? fields : [];

        AppSettings.get({
          'sequential': 1,
          'debug': config.DEBUG,
          'return': fields
        }, function (data) {
          deferred.resolve(data.values);
        }, function () {
          deferred.reject('Unable to fetch settings list');
        });

        return deferred.promise;
      }
    };
  }

  return appsettingsService;
});
