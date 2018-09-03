/* eslint-env amd */

define(function () {
  'use strict';

  Task.$inject = ['$resource', '$httpParamSerializer', 'config', '$log'];

  function Task ($resource, $httpParamSerializer, config, $log) {
    $log.debug('Service: Task');

    return $resource(config.url.REST, {
      'action': 'get',
      'entity': 'Task',
      sequential: 1,
      debug: config.DEBUG
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

  return { Task: Task };
});
