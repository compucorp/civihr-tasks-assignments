/* eslint-env amd */

define(function () {
  'use strict';

  Document.$inject = ['$resource', '$httpParamSerializer', 'config', '$log'];

  function Document ($resource, $httpParamSerializer, config, $log) {
    $log.debug('Resource: Document');

    return $resource(config.url.REST, {
      'action': 'get',
      'entity': 'Document',
      'sequential': 1,
      'debug': config.DEBUG
    }, {
      save: {
        method: 'POST',
        isArray: false,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: $httpParamSerializer
      }
    });
  }

  return { Document: Document };
});
