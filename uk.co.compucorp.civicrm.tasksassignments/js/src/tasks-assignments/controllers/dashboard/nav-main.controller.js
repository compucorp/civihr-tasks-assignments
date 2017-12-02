/* eslint-env amd */

define([
  'tasks-assignments/controllers/controllers'
], function (controllers) {
  'use strict';

  controllers.controller('NavMainCtrl', ['$scope', '$state', '$log',
    function ($scope, $state, $log) {
      $log.debug('Controller: NavMainCtrl');

      $scope.isActive = function (viewLocation) {
        return $state.includes(viewLocation);
      };
    }]);
});
