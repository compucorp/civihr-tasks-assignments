/* eslint-env amd */

define(function (angular, _, services) {
  'use strict';

  Relationship.__name = 'Relationship';
  Relationship.$inject = ['$resource', 'config', '$log'];

  function Relationship ($resource, config, $log) {
    $log.debug('Resource: Relationship');

    return $resource(config.url.REST, {
      'action': 'get',
      'entity': 'Relationship',
      'json': {}
    });
  }

  return Relationship;
});
