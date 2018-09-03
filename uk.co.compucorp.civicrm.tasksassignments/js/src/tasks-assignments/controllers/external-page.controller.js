/* eslint-env amd */

define(function () {
  'use strict';

  ExternalPageController.$inject = [
    '$log', '$rootElement', '$rootScope', '$scope', '$state', '$uibModal', 'config'
  ];

  function ExternalPageController ($log, $rootElement, $rootScope, $scope, $state,
    $modal, config) {
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
