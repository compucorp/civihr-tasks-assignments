/* global angular */

(function (angular) {
  'use strict';

  angular.module('crm-tasks-workflows.controllers')
    .controller('CaseTypeExtendedController', CaseTypeExtendedController);

  CaseTypeExtendedController.$inject = [
    '$controller', '$log', '$scope', 'crmApi', 'apiCalls', 'activityOptionsTask', 'activityOptionsDocument'
  ];

  function CaseTypeExtendedController ($controller, $log, $scope, crmApi, apiCalls, activityOptionsTask, activityOptionsDocument) {
    $log.debug('Controller: CaseTypeExtendedController');

    var parentMethods = {};

    (function init () {
      initParentController();

      parentMethods.addActivity = $scope.addActivity;
      $scope.addActivity = addActivity;
    })();

    /**
     * Add new activity
     *
     * @param {Array} activitySet
     * @param {String} activityType
     */
    function addActivity (activitySet, activityType) {
      // call parent
      parentMethods.addActivity(activitySet, activityType);

      // remove reference_activity property from newly added activity
      activitySet.activityTypes.forEach(function (activity) {
        if (activity.name === activityType) {
          delete activity.reference_activity;
        }
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
  }
})(angular);
