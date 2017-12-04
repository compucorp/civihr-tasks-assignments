/* eslint-env amd */

define(function () {
  'use strict';

  NavMainCtrl.__name = 'NavMainCtrl';
  NavMainCtrl.$inject = ['$scope', '$state', '$log'];

  function NavMainCtrl ($scope, $state, $log) {
    $log.debug('Controller: NavMainCtrl');

    $scope.isActive = function (viewLocation) {
      return $state.includes(viewLocation);
    };
  }

  return NavMainCtrl;
});
