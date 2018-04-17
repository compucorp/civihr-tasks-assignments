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

    $controller('CaseTypeCtrl', {$scope: $scope, crmApi: crmApi, apiCalls: apiCalls});

    var originalAddActivity = $scope.addActivity;

    $scope.addActivity = addActivity;

    (function init () {
      prepareActivityTypes();
    })();

    /**
     * Add new activity
     *
     * @param {Array} activitySet
     * @param {String} activityType
     */
    function addActivity (activitySet, activityType) {
      // call parent
      originalAddActivity(activitySet, activityType);

      // remove reference_activity property from newly added activity
      activitySet.activityTypes.forEach(function (activity) {
        if (activity.name === activityType) {
          delete activity.reference_activity;

          return false;
        }
      });
    }

    /**
     * Add component type label to activity types
     */
    function prepareActivityTypes () {
      var taskOptions = activityOptionsTask.values.map(function (type) {
        return { id: type.name, text: (type.label + ' (Task)'), icon: type.icon };
      });

      var documentOptions = activityOptionsDocument.values.map(function (type) {
        return { id: type.name, text: (type.label + ' (Document)'), icon: type.icon };
      });

      $scope.activityTypeOptions = taskOptions.concat(documentOptions);
    }
  }
})(angular);
