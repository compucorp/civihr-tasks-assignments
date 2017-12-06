/* eslint-env amd */

define(function () {
  'use strict';

  NavMainController.__name = 'NavMainController';
  NavMainController.$inject = ['$scope', '$state', '$log'];

  function NavMainController ($scope, $state, $log) {
    $log.debug('Controller: NavMainController');

    $scope.isActive = function (viewLocation) {
      return $state.includes(viewLocation);
    };
  }

  return NavMainController;
});
