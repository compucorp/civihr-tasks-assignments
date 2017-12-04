/* eslint-env amd */

define([
  'common/moment'
], function (moment) {
  'use strict';

  KeyDateService.__name = 'KeyDateService';
  KeyDateService.$inject = ['KeyDate', '$q', 'config', 'UtilsService', '$log'];

  function KeyDateService (KeyDate, $q, config, UtilsService, $log) {
    $log.debug('Service: KeyDateService');

    return {
      get: function (dateStart, dateEnd) {
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
    };
  }

  return KeyDateService;
});
