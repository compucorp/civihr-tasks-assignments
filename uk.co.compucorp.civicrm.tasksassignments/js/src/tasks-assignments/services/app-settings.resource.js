/* eslint-env amd */

define(function () {
  'use strict';

  AppSettings.$inject = ['$resource', 'config', '$log'];

  function AppSettings ($resource, config, $log) {
    $log.debug('Service: Settings');

    return $resource(config.url.REST, {
      'action': 'get',
      'entity': 'Setting',
      'json': {}
    });
  }

  return { AppSettings: AppSettings };
});
