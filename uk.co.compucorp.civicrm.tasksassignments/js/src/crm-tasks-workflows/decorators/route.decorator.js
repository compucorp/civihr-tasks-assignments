/* global angular */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.decorator')
    .config(['$provide', '$routeProvider', function ($provide, $routeProvider) {
      $provide.decorator('$route', RouteDecorator);
    }]);

  RouteDecorator.$inject = ['$delegate'];

  function RouteDecorator ($delegate) {
    (function init () {
      $delegate.routes['/caseType/:id'].controller = 'CaseTypeExtendedController';
      addActivityOptionsTask();
      addActivityOptionsDocument();
    })();

    function addActivityOptionsTask () {
      $delegate.routes['/caseType/:id'].resolve.activityOptionsTask = activityOptionsTask;
      activityOptionsTask.$inject = ['crmApi'];

      function activityOptionsTask (crmApi) {
        return crmApi('OptionValue', 'get', {
          option_group_id: 'activity_type',
          component_id: 'CiviTask',
          sequential: 1,
          options: {
            sort: 'name',
            limit: 0
          }
        });
      }
    }

    function addActivityOptionsDocument () {
      $delegate.routes['/caseType/:id'].resolve.activityOptionsDocument = activityOptionsDocument;
      activityOptionsDocument.$inject = ['crmApi'];

      function activityOptionsDocument (crmApi) {
        return crmApi('OptionValue', 'get', {
          option_group_id: 'activity_type',
          component_id: 'CiviDocument',
          sequential: 1,
          options: {
            sort: 'name',
            limit: 0
          }
        });
      }
    }

    return $delegate;
  }
})(angular);
