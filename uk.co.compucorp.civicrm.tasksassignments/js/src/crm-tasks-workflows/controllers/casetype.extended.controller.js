/* global angular */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.controllers')
    .controller('CaseTypeExtendedController', CaseTypeExtendedController);

  CaseTypeExtendedController.$inject = [
    '$controller', '$log', '$scope', 'crmApi', 'apiCalls'
  ];

  function CaseTypeExtendedController ($controller, $log, $scope, crmApi, apiCalls) {
    $log.debug('Controller: CaseTypeExtendedController');

    $controller('CaseTypeCtrl', {$scope: $scope, crmApi: crmApi, apiCalls: apiCalls});

    $scope.activityTypeOptions = [];
    $scope.loading = {
      activityOptions: false
    };

    (function init () {
      fetchActivityTypes();
    })();

    /**
     * Fetch activity types which are components of CiviTask or CiviDocument
     *
     * @return {Promise}
     */
    function fetchActivityTypes () {
      $scope.loading.activityOptions = true;

      return crmApi('OptionValue', 'get', {
        option_group_id: 'activity_type',
        component_id: { 'IN': ['CiviTask', 'CiviDocument'] },
        sequential: 1,
        options: {
          sort: 'name',
          limit: 0
        }
      }).then(function (data) {
        $scope.activityTypeOptions = data.values.map(function (type) {
          return { id: type.name, text: type.label, icon: type.icon };
        });
      }).finally(function () {
        $scope.loading.activityOptions = false;
      });
    }
  }
})(angular);
