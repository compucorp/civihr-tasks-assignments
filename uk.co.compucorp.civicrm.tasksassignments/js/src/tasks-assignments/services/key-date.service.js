/* eslint-env amd */

define([
  'common/moment'
], function (moment) {
  'use strict';

  keyDateService.__name = 'keyDateService';
  keyDateService.$inject = ['KeyDate', '$q', 'config', 'utilsService', '$log'];

  function keyDateService (KeyDate, $q, config, utilsService, $log) {
    $log.debug('Service: keyDateService');

    return {
      get: get
    };

    function get (dateStart, dateEnd) {
      var deferred = $q.defer();

      if (!dateStart || !dateEnd) {
        return null;
      }

      dateStart = dateStart ? moment(dateStart).format('YYYY-MM-DD') : null;
      dateEnd = dateEnd ? moment(dateEnd).format('YYYY-MM-DD') : null;

      KeyDate.get({ json: {
        'start_date': dateStart,
        'end_date': dateEnd
      }}, function (data) {
        deferred.resolve(data.values);
      }, function () {
        deferred.reject('Unable to fetch documents list');
      });

      return deferred.promise;
    }
  }

  return keyDateService;
});
