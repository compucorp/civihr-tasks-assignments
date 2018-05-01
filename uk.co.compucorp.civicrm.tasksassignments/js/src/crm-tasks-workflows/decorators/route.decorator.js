/* global angular */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.decorators')
    .config(['$provide', '$routeProvider', function ($provide, $routeProvider) {
      $provide.decorator('$route', RouteDecorator);
    }]);

  RouteDecorator.$inject = ['$delegate'];

  function RouteDecorator ($delegate) {
    (function init () {
      var caseTypeEditRoute = $delegate.routes['/caseType/:id'];

      caseTypeEditRoute.controller = 'CaseTypeExtendedController';
      caseTypeEditRoute.resolve.activityOptionsTask = getResolverForActivityTypeComponent('CiviTask');
      caseTypeEditRoute.resolve.activityOptionsDocument = getResolverForActivityTypeComponent('CiviDocument');
    })();

    function getResolverForActivityTypeComponent (componentName) {
      activityOptionsResolver.$inject = ['crmApi'];

      function activityOptionsResolver (crmApi) {
        return crmApi('OptionValue', 'get', {
          option_group_id: 'activity_type',
          component_id: componentName,
          sequential: 1,
          options: { sort: 'name', limit: 0 }
        });
      }

      return activityOptionsResolver;
    }

    return $delegate;
  }
})(angular);
