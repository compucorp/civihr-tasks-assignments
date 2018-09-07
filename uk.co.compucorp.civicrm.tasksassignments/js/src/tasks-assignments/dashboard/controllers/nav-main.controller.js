/* eslint-env amd */

define(function () {
  'use strict';

  NavMainController.$inject = ['$log', '$scope', '$state'];

  function NavMainController ($log, $scope, $state) {
    $log.debug('Controller: NavMainController');

    $scope.isActive = isActive;

    function isActive (viewLocation) {
      return $state.includes(viewLocation);
    }
  }

  return { NavMainController: NavMainController };
});
