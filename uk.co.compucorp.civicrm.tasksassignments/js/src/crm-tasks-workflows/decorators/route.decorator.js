/* global angular */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.decorators')
    .config(['$provide', function ($provide) {
      $provide.decorator('$route', RouteDecorator);
    }]);

  RouteDecorator.$inject = ['$delegate'];

  function RouteDecorator ($delegate) {
    (function init () {
      var caseTypeEditRoute = $delegate.routes['/caseType/:id'];
      var caseTypeListRoute = $delegate.routes['/caseType'];

      caseTypeEditRoute.controller = 'CaseTypeExtendedController';
      caseTypeEditRoute.resolve.activityOptionsTask = getResolverForActivityTypeComponent('CiviTask');
      caseTypeEditRoute.resolve.activityOptionsDocument = getResolverForActivityTypeComponent('CiviDocument');

      caseTypeListRoute.resolve.caseTypes = getResolverForWorkflowTypes();
    })();

    /**
     * Returns a resolver for the list of activity types for a particular component.
     *
     * @param  {String} componentName - the name of the activity type's component.
     * @return {Array}  An array containing the function that will resolve the activity types.
     */
    function getResolverForActivityTypeComponent (componentName) {
      return ['crmApi', function activityOptionsResolver (crmApi) {
        return crmApi('OptionValue', 'get', {
          option_group_id: 'activity_type',
          component_id: componentName,
          sequential: 1,
          options: { sort: 'name', limit: 0 }
        });
      }];
    }

    /**
     * Returns a resolver for the list of workflow case types.
     *
     * @return {Function} the function that will resolve the workflow case types.
     */
    function getResolverForWorkflowTypes () {
      return ['crmApi', function workflowTypesResolver (crmApi) {
        return crmApi('CaseType', 'get', {
          category: 'WORKFLOW',
          options: { limit: 0 }
        });
      }];
    }

    return $delegate;
  }
})(angular);
