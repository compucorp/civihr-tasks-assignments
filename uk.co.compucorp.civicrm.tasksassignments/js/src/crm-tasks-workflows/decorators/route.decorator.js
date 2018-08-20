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
      caseTypeEditRoute.resolve.defaultCaseTypeCategory = getResolverForDefaultCaseTypeCategory();

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
     * To filter by category we need to use the custom category field id as
     * provided by the CRM vars. The category field can be referenced by using
     * `custom_123` where `123` is the id of the category field.
     *
     * @return {Array} An array containing the function that will resolve the workflow case types.
     */
    function getResolverForWorkflowTypes () {
      return ['crmApi', 'customFieldIds', function workflowTypesResolver (crmApi, customFieldIds) {
        var caseTypeCategoryField = 'custom_' + customFieldIds['caseType.category'];
        var filters = { options: { limit: 0 } };
        filters[ caseTypeCategoryField ] = 'Workflow';

        return crmApi('CaseType', 'get', filters);
      }];
    }

    /**
     * Returns a resolver for the default case type category. The default category
     * is the one selected as such on the API.
     *
     * @return {Array} An array containing the dependencies and function that will
     * resolve the default case type category value.
     */
    function getResolverForDefaultCaseTypeCategory () {
      return ['crmApi', function defaultCaseTypeCategoryResolver (crmApi) {
        return crmApi('OptionValue', 'get', {
          sequential: 1,
          option_group_id: 'case_type_category',
          is_default: 1,
          options: { limit: 1 }
        })
          .then(function (defaultCaseTypeCategoryResponse) {
            var defaultCaseTypeCategory = defaultCaseTypeCategoryResponse.values[0] || {};

            return defaultCaseTypeCategory.value;
          });
      }];
    }

    return $delegate;
  }
})(angular);
