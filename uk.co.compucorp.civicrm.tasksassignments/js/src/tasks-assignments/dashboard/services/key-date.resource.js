/* eslint-env amd */

define(function () {
  'use strict';

  KeyDate.$inject = ['$resource', 'config', '$log'];

  function KeyDate ($resource, config, $log) {
    $log.debug('Resource: KeyDate');

    return $resource(config.url.REST, {
      'action': 'get',
      'entity': 'KeyDates',
      'json': {}
    });
  }

  return { KeyDate: KeyDate };
});
