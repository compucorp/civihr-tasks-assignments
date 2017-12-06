/* eslint-env amd */

define(function () {
  'use strict';

  TopBarController.__name = 'TopBarController';
  TopBarController.$inject = ['$scope', '$rootScope', '$state', '$log'];

  function TopBarController ($scope, $rootScope, $state, $log) {
    $log.debug('Controller: TopBarController');

    $rootScope.itemAdd = {};
    $rootScope.itemAdd.fn = function () {
      $state.includes('documents') ? $rootScope.modalDocument() : $rootScope.modalTask();
    };
    $rootScope.itemAdd.label = function () {
      return $state.includes('documents') ? 'Add Document' : 'Add Task';
    };
  }

  return TopBarController;
});
