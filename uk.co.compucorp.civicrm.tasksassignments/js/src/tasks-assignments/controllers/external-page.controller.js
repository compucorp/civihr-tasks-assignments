/* eslint-env amd */

define(function () {
  'use strict';

  ExternalPageController.__name = 'ExternalPageController';
  ExternalPageController.$inject = [
    '$scope', '$log', '$uibModal', '$rootElement', '$rootScope', '$state', 'config'
  ];

  function ExternalPageController ($scope, $log, $modal, $rootElement, $rootScope,
    $state, config) {
    $log.debug('Controller: ExternalPageController');

    $scope.assignmentsUrl = config.url.ASSIGNMENTS + '?reset=1';
    $scope.reportsUrl = config.url.CIVI_DASHBOARD + '?reset=1';

    $scope.$on('assignmentFormSuccess', function () {
      $state.go($state.current, {}, {reload: true});
    });

    $scope.$on('iframe-ready', function () {
      $rootScope.$broadcast('ct-spinner-hide');
    });
  }

  return ExternalPageController;
});
