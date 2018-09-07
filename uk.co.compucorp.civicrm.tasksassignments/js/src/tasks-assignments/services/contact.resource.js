/* eslint-env amd */

define(function () {
  'use strict';

  Contact.$inject = [
    '$resource', 'config', '$log'
  ];

  function Contact ($resource, config, $log) {
    $log.debug('Resource: Contact');

    return $resource(config.url.REST, {
      action: 'get',
      entity: 'contact',
      debug: config.DEBUG
    });
  }

  return { Contact: Contact };
});
