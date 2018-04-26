/* eslint-env jasmine */
/* global angular */

(function () {
  'use strict';

  describe('CaseTypeExtendedController', function () {
    var $controller, $log, $rootScope, $scope, CaseTypeCtrl, parentControllerSpy,
      TaskActivityOptionsData, DocumentActivityOptionsData;

    beforeEach(module('crm-tasks-workflows.mocks', 'crm-tasks-workflows.controllers', function ($controllerProvider) {
      var caseType = {
        definition: {
          activitySets: [{
            activityTypes: [{ name: 'Open Case', status: 'Completed' }]
          }]
        }
      };

      parentControllerSpy = jasmine.createSpy('parentControllerSpy');

      // mocks the original CaseTypeCtrl:
      CaseTypeCtrl = ['$scope', 'crmApi', 'apiCalls', function ($scope, crmApi,
        apiCalls) {
        $scope.caseType = caseType;

        parentControllerSpy(apiCalls);
      }];

      $controllerProvider.register('CaseTypeCtrl', CaseTypeCtrl);
    }));

    beforeEach(inject(function (_$controller_, _$log_, _$rootScope_, _TaskActivityOptionsData_, _DocumentActivityOptionsData_) {
      $controller = _$controller_;
      $log = _$log_;
      $rootScope = _$rootScope_;
      DocumentActivityOptionsData = _DocumentActivityOptionsData_;
      TaskActivityOptionsData = _TaskActivityOptionsData_;

      spyOn($log, 'debug');
      initController();
    }));

    describe('when initialized', function () {
      var expectedApiCalls;

      beforeEach(function () {
        expectedApiCalls = { actTypes: { values: getActivityTypes() } };
      });

      it('initialises the parent controller with activity types having component labels', function () {
        expect(parentControllerSpy).toHaveBeenCalledWith(expectedApiCalls);
      });
    });

    describe('addActivity', function () {
      var activityTypes, activityType;
      var addActivityInParent = jasmine.createSpy('addActivityInParent');

      beforeEach(function () {
        $scope = $rootScope.$new();
        $scope.addActivity = addActivityInParent;

        activityTypes = getActivityTypes();
        activityTypes[0].reference_activity = '1';
        activityType = activityTypes[0].name;

        initController($scope);
        $scope.addActivity({ activityTypes: activityTypes }, activityType);
      });

      it('calls the parent function', function () {
        expect(addActivityInParent).toHaveBeenCalledWith({ activityTypes: activityTypes }, activityType);
      });

      it('removes the reference property for the activity type', function () {
        expect(activityTypes[0].reference_activity).toBeUndefined();
      });
    });

    /**
     * Initialise the controller
     *
     * @param {Object} $scope
     */
    function initController ($scope) {
      $scope = $scope || $rootScope.$new();

      $controller('CaseTypeExtendedController', {
        $scope: $scope,
        crmApi: {},
        apiCalls: {},
        activityOptionsTask: { values: angular.copy(TaskActivityOptionsData) },
        activityOptionsDocument: { values: angular.copy(DocumentActivityOptionsData) }
      });

      $scope.$digest();
    }

    /**
     * Get list of activity types with component type added to label
     *
     * @return {Array} activity types
     */
    function getActivityTypes () {
      var taskOptions = TaskActivityOptionsData.map(function (type) {
        type.label = (type.label + ' (Task)');

        return type;
      });

      var documentOptions = DocumentActivityOptionsData.map(function (document) {
        document.label = (document.label + ' (Document)');

        return document;
      });

      return taskOptions.concat(documentOptions);
    }
  });
})();
