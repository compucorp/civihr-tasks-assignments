/* eslint-env amd */

define(function () {
  'use strict';

  appSettingsService.$inject = [
    'AppSettings', '$q', 'config', 'utilsService', '$log'
  ];

  function appSettingsService (AppSettings, $q, config, utilsService, $log) {
    $log.debug('Service: appSettingsService');

    return {
      get: get
    };

    /**
     * Get app setting form backend using Setting Entity
     *
     * @param  {array} fields
     * @return {promise}
     */
    function get (fields) {
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
  }

  return { appSettingsService: appSettingsService };
});
