/* eslint-env amd */

define(function () {
  'use strict';

  TopBarCtrl.__name = 'TopBarCtrl';
  TopBarCtrl.$inject = ['$scope', '$rootScope', '$state', '$log'];

  function TopBarCtrl ($scope, $rootScope, $state, $log) {
    $log.debug('Controller: TopBarCtrl');

    $rootScope.itemAdd = {};
    $rootScope.itemAdd.fn = function () {
      $state.includes('documents') ? $rootScope.modalDocument() : $rootScope.modalTask();
    };
    $rootScope.itemAdd.label = function () {
      return $state.includes('documents') ? 'Add Document' : 'Add Task';
    };
  }

  return TopBarCtrl;
});
