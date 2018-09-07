/* eslint-env amd */

define(function () {
  'use strict';

  TopBarController.$inject = ['$log', '$rootScope', '$state'];

  function TopBarController ($log, $rootScope, $state) {
    $log.debug('Controller: TopBarController');

    $rootScope.itemAdd = {};
    $rootScope.itemAdd.fn = function () {
      $state.includes('documents') ? $rootScope.modalDocument() : $rootScope.modalTask();
    };
    $rootScope.itemAdd.label = function () {
      return $state.includes('documents') ? 'Add Document' : 'Add Task';
    };
  }

  return { TopBarController: TopBarController };
});
