/* eslint-env amd */

define(function () {
  'use strict';

  AssignmentsController.$inject = ['$log'];

  function AssignmentsController ($log) {
    $log.info('Controller: AssignmentsController');
  }

  return { AssignmentsController: AssignmentsController };
});
