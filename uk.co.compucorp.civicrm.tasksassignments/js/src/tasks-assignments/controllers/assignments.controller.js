/* eslint-env amd */

define(function () {
  'use strict';

  AssignmentsController.__name = 'AssignmentsController';
  AssignmentsController.$inject = [
    '$scope', '$log', '$uibModal', '$rootElement', '$rootScope', '$state', 'config'
  ];

  function AssignmentsController ($scope, $log, $modal, $rootElement, $rootScope, $state,
    config) {
    $log.info('Controller: AssignmentsController');
  }

  return AssignmentsController;
});
