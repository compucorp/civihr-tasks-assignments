/* global angular */

(function (angular) {
  var coreModules = ['crmCaseType'];

  angular.module('crm-tasks-workflows', coreModules.concat([
    'crm-tasks-workflows.controllers',
    'crm-tasks-workflows.decorators'
  ]));
})(angular);
