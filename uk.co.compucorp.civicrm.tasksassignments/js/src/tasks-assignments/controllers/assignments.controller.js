/* eslint-env amd */

define(function () {
  'use strict';

  AssignmentsController.$inject = [
    '$log', '$rootElement', '$rootScope', '$scope', '$uibModal', '$state', 'config'
  ];

  function AssignmentsController ($log, $rootElement, $rootScope, $scope, $modal,
    $state, config) {
    $log.info('Controller: AssignmentsController');
  }

  return { AssignmentsController: AssignmentsController };
});
