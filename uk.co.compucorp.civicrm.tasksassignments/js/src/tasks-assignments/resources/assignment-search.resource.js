/* eslint-env amd */

define(function () {
  'use strict';

  AssignmentSearch.__name = 'AssignmentSearch';
  AssignmentSearch.$inject = ['$resource', 'config', '$log'];

  function AssignmentSearch ($resource, config, $log) {
    $log.debug('Resource: AssignmentSearch');

    return $resource(config.url.ASSIGNMENTS + '/ajax/unclosed');
  }

  return AssignmentSearch;
});
