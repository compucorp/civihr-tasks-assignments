/* global angular */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.core')
    .config(['$provide', '$routeProvider', function ($provide, $routeProvider) {
      $provide.decorator('$route', routeDecorator);

      routeDecorator.$inject = ['$delegate'];

      function routeDecorator ($delegate) {
        $delegate.routes['/caseType/:id'].controller = 'CaseTypeExtendedController';
        $delegate.routes['/caseType/:id'].resolve.activityOptions = activityOptions;

        activityOptions.$inject = ['crmApi'];

        function activityOptions (crmApi) {
          return crmApi('OptionValue', 'get', {
            option_group_id: 'activity_type',
            component_id: { 'IN': ['CiviTask', 'CiviDocument'] },
            sequential: 1,
            options: {
              sort: 'name',
              limit: 0
            }
          });
        }

        return $delegate;
      }
    }]);
})(angular);
