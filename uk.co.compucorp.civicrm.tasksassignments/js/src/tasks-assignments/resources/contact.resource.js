/* eslint-env amd */

define(function () {
  'use strict';

  Contact.$inject = [
    '$resource', '$httpParamSerializer', 'config', '$log'
  ];

  function Contact ($resource, $httpParamSerializer, config, $log) {
    $log.debug('Resource: Contact');

    return $resource(config.url.REST, {
      action: 'get',
      entity: 'contact',
      debug: config.DEBUG
    });
  }

  return { Contact: Contact };
});
