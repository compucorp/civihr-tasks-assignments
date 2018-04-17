/* global angular */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.core')
    .config(['$provide', '$routeProvider', function ($provide, $routeProvider) {
      $provide.decorator('$route', routeDecorator);

      routeDecorator.$inject = ['$delegate'];

      function routeDecorator ($delegate) {
        $delegate.routes['/caseType/:id'].controller = 'CaseTypeExtendedController';

        return $delegate;
      }
    }]);
})(angular);
