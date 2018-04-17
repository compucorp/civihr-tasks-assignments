/* global angular */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.controllers')
    .controller('CaseTypeExtendedController', CaseTypeExtendedController);

  CaseTypeExtendedController.$inject = [
    '$controller', '$log', '$scope', 'crmApi', 'apiCalls', 'activityOptions'
  ];

  function CaseTypeExtendedController ($controller, $log, $scope, crmApi, apiCalls, activityOptions) {
    $log.debug('Controller: CaseTypeExtendedController');

    $controller('CaseTypeCtrl', {$scope: $scope, crmApi: crmApi, apiCalls: apiCalls});

    (function init () {
      fetchActivityTypes();
    })();

    /**
     * Fetch activity types
     *
     * @return {Promise}
     */
    function fetchActivityTypes () {
      $scope.activityTypeOptions = activityOptions.values.map(function (type) {
        return { id: type.name, text: type.label, icon: type.icon };
      });
    }
  }
})(angular);
