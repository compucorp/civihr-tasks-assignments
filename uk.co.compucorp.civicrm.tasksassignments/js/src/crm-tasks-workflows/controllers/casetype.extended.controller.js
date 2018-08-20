/* global angular */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.controllers')
    .controller('CaseTypeExtendedController', CaseTypeExtendedController);

  CaseTypeExtendedController.$inject = [
    '$controller', '$log', '$scope', 'crmApi', 'apiCalls', 'activityOptionsTask', 'activityOptionsDocument',
    'customFieldIds'
  ];

  function CaseTypeExtendedController ($controller, $log, $scope, crmApi, apiCalls, activityOptionsTask, activityOptionsDocument,
    customFieldIds) {
    $log.debug('Controller: CaseTypeExtendedController');

    var parentMethods = {};

    (function init () {
      var isNewCaseType;

      initParentController();

      parentMethods.addActivity = $scope.addActivity;
      $scope.addActivity = addActivity;
      $scope.defaultRelationshipTypeOptions = getDefaultRelationshipTypeOptions();
      isNewCaseType = !$scope.caseType.id;

      if (isNewCaseType) {
        setCaseTypeDefaultCategory();
        clearAllActivityTypesFromMainActivitySet();
      }
    })();

    /**
     * Add new activity
     *
     * @param {Array} activitySet
     * @param {String} activityType
     */
    function addActivity (activitySet, activityType) {
      parentMethods.addActivity(activitySet, activityType);

      // remove reference_activity property from newly added activity
      activitySet.activityTypes.forEach(function (activity) {
        if (activity.name === activityType) {
          delete activity.reference_activity;
        }
      });
    }

    /**
     * Clears all the activity types defined in the main activity set.
     */
    function clearAllActivityTypesFromMainActivitySet () {
      $scope.caseType.definition.activitySets[0].activityTypes = [];
    }

    /**
     * Returns the default relationship type options. If the relationship is
     * bidirectional (Ex: Spouse of) it adds a single option otherwise it adds
     * two options representing the relationship type directions
     * (Ex: Employee of, Employer is)
     *
     * @return {Array}
     */
    function getDefaultRelationshipTypeOptions () {
      var activeRelationshipTypes = getActiveRelationshipTypes();
      var defaultRelationshipTypeOptions = [];

      activeRelationshipTypes.forEach(function (relationshipType) {
        var isBidirectionalRelationship = relationshipType.label_a_b === relationshipType.label_b_a;

        defaultRelationshipTypeOptions.push({
          label: relationshipType.label_b_a,
          value: relationshipType.id + '_b_a'
        });

        if (!isBidirectionalRelationship) {
          defaultRelationshipTypeOptions.push({
            label: relationshipType.label_a_b,
            value: relationshipType.id + '_a_b'
          });
        }
      });

      return defaultRelationshipTypeOptions;
    }

    /**
     * Returns a list of active relationship types.
     *
     * @return {Array}
     */
    function getActiveRelationshipTypes () {
      return apiCalls.relTypes.values.filter(function (relationshipType) {
        return relationshipType.is_active === '1';
      });
    }

    /**
     * Initialise the parent controller
     */
    function initParentController () {
      apiCalls.actTypes = { values: prepareActivityTypes() };
      $controller('CaseTypeCtrl', {$scope: $scope, crmApi: crmApi, apiCalls: apiCalls});
    }

    /**
     * Get list of activity types with component type added to label
     *
     * @return {Array}
     */
    function prepareActivityTypes () {
      var taskOptions = activityOptionsTask.values.map(function (type) {
        type.label = (type.label + ' (Task)');

        return type;
      });

      var documentOptions = activityOptionsDocument.values.map(function (document) {
        document.label = (document.label + ' (Document)');

        return document;
      });

      return taskOptions.concat(documentOptions);
    }

    /**
     * Sets the default category for the case type. In this case the default
     * category is Workflow.
     */
    function setCaseTypeDefaultCategory () {
      var categoryFieldname = 'custom_' + customFieldIds['caseType.category'];
      var DEFAULT_CATEGORY = 'Workflow';

      $scope.caseType[categoryFieldname] = DEFAULT_CATEGORY;
    }
  }
})(angular);
