/* eslint-env jasmine */
/* global angular */

(function () {
  'use strict';

  describe('CaseTypeExtendedController', function () {
    var $controller, $log, $rootScope, $scope, CaseTypeCtrl, parentControllerSpy,
      TaskActivityOptionsData, DocumentActivityOptionsData;

    beforeEach(module('crm-tasks-workflows.mocks', 'crm-tasks-workflows.controllers', function ($controllerProvider) {
      var defaultCaseType = getMockCaseType();

      parentControllerSpy = jasmine.createSpy('parentControllerSpy');

      // mocks the original CaseTypeCtrl:
      CaseTypeCtrl = ['$scope', 'crmApi', 'apiCalls', function ($scope, crmApi,
        apiCalls) {
        parentControllerSpy(apiCalls);

        $scope.caseType = apiCalls.caseType ? apiCalls.caseType : defaultCaseType;
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

    describe('when creating a new case type', function () {
      beforeEach(function () {
        $scope = $rootScope.$new();

        initController($scope);
      });

      it('clears all activities from the main activity set', function () {
        expect($scope.caseType.definition.activitySets[0].activityTypes).toEqual([]);
      });
    });

    describe('when editing an existing case type', function () {
      var caseType = getMockCaseType();

      beforeEach(function () {
        $scope = $rootScope.$new();
        caseType.id = 100;

        initController($scope, {
          caseType: caseType
        });
      });

      it('does not clear the activity types from the main activity set', function () {
        expect($scope.caseType.definition.activitySets[0].activityTypes).not.toEqual([]);
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
     * @param {Object} scope - an optional custom $scope to pass to the controller.
     * @param {Object} apiCalls - an optional apiCalls mock object to pass to the controller.
     */
    function initController (scope, apiCalls) {
      $scope = scope || $rootScope.$new();
      apiCalls = angular.copy(apiCalls || {});

      $controller('CaseTypeExtendedController', {
        $scope: $scope,
        crmApi: {},
        apiCalls: apiCalls,
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

    /**
     * Returns a mock for Case Types
     *
     * @return {Object}
     */
    function getMockCaseType () {
      return {
        definition: {
          activitySets: [{
            activityTypes: [{ name: 'Open Case', status: 'Completed' }]
          }]
        }
      };
    }
  });
})();
