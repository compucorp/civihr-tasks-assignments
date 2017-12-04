/* eslint-env amd */

define([
  'tasks-assignments/services/contact.service'
], function () {
  'use strict';

  AssignmentsCtrl.__name = 'AssignmentsCtrl';
  AssignmentsCtrl.$inject = [
    '$scope', '$log', '$uibModal', '$rootElement', '$rootScope', '$state', 'config'
  ];

  function AssignmentsCtrl ($scope, $log, $modal, $rootElement, $rootScope, $state,
    config) {
    $log.info('Controller: AssignmentsCtrl');
  }

  return AssignmentsCtrl;
});
