/* global angular */

(function () {
  angular.module('crm-tasks-workflows.mocks')
    .controller('CaseTypeCtrl', function ($scope, crmApi, apiCalls, $log) {
      $log.debug('Init CaseTypeCtrl with', $scope, crmApi, apiCalls);
    });
})();
