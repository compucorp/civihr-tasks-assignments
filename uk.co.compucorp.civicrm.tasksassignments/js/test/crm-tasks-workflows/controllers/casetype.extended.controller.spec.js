/* eslint-env jasmine */
/* global angular */

(function () {
  'use strict';

  describe('CaseTypeExtendedController', function () {
    var $controller, $log, $rootScope, $scope, TaskActivityOptionsData, DocumentActivityOptionsData;

    beforeEach(function () {
      module('crm-tasks-workflows.mocks', 'crm-tasks-workflows.controllers');
    });

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
      var expectedValue;

      beforeEach(function () {
        expectedValue = { actTypes: { values: getActivityTypes() } };
      });

      it('initialises the parent controller with activity types having component labels', function () {
        expect($log.debug).toHaveBeenCalledWith('Init CaseTypeCtrl with', jasmine.any(Object), jasmine.any(Object), expectedValue);
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
