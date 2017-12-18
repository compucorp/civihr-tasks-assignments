/* eslint-env amd */

define(function () {
  'use strict';

  Settings.__name = 'Settings';
  Settings.$inject = ['$resource', 'config', '$log'];

  function Settings ($resource, config, $log) {
    $log.debug('Service: Settings');

    return $resource(config.url.REST, {
      'action': 'get',
      'entity': 'TASettings',
      'json': {}
    });
  }

  return Settings;
});
