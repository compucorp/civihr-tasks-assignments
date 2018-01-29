/* eslint-env amd */

define(function () {
  'use strict';

  Assignment.__name = 'Assignment';
  Assignment.$inject = ['$resource', 'config', '$log'];

  function Assignment ($resource, config, $log) {
    $log.debug('Resource: Assignment');

    return $resource(config.url.REST, {
      'action': 'get',
      'entity': 'Assignment',
      'json': {}
    });
  }

  return Assignment;
});
