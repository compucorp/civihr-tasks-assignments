/* eslint-env amd */

define(function () {
  'use strict';

  AssignmentSearch.$inject = ['$resource', 'config', '$log'];

  function AssignmentSearch ($resource, config, $log) {
    $log.debug('Resource: AssignmentSearch');

    return $resource(config.url.ASSIGNMENTS + '/ajax/unclosed');
  }

  return { AssignmentSearch: AssignmentSearch };
});
