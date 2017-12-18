/* eslint-env amd */

define(function () {
  'use strict';

  AssignmentType.__name = 'AssignmentType';
  AssignmentType.$inject = ['$resource', 'config', '$log'];

  function AssignmentType ($resource, config, $log) {
    $log.debug('Resource: AssignmentType');

    return $resource(config.url.REST, {
      'action': 'get',
      'entity': 'CaseType',
      'json': {
        'is_active': 1
      }
    });
  }

  return AssignmentType;
});
