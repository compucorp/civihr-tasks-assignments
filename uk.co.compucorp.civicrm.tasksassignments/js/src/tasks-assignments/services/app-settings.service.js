/* eslint-env amd */

define(function () {
  'use strict';

  AppSettingsService.__name = 'AppSettingsService';
  AppSettingsService.$inject = [
    'AppSettings', '$q', 'config', 'UtilsService', '$log'
  ];

  function AppSettingsService (AppSettings, $q, config, UtilsService, $log) {
    $log.debug('Service: AppSettingsService');

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

  return AppSettingsService;
});
