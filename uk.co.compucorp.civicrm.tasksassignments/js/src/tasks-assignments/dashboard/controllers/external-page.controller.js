/* eslint-env amd */

define(function () {
  'use strict';

  ExternalPageController.$inject = ['$log', '$rootScope', '$scope', '$state', 'config'];

  function ExternalPageController ($log, $rootScope, $scope, $state, config) {
    $log.debug('Controller: ExternalPageController');

    $scope.assignmentsUrl = config.url.ASSIGNMENTS + '?reset=1';
    $scope.reportsUrl = config.url.CIVI_DASHBOARD + '?reset=1';

    (function init () {
      initListeners();
    }());

    function initListeners () {
      $scope.$on('assignmentFormSuccess', function () {
        $state.go($state.current, {}, {reload: true});
      });

      $scope.$on('iframe-ready', function () {
        $rootScope.$broadcast('ct-spinner-hide');
      });
    }
  }

  return { ExternalPageController: ExternalPageController };
});
