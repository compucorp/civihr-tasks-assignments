/* eslint-env jasmine */

(function () {
  'use strict';

  describe('CaseTypeExtendedController', function () {
    var $controller, $rootScope, $scope, TaskActivityOptionsData, DocumentActivityOptionsData;

    beforeEach(function () {
      module('crm-tasks-workflows.mocks', 'crm-tasks-workflows.controllers');
    });

    beforeEach(inject(function (_$controller_, _$rootScope_, _TaskActivityOptionsData_, _DocumentActivityOptionsData_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      DocumentActivityOptionsData = _DocumentActivityOptionsData_;
      TaskActivityOptionsData = _TaskActivityOptionsData_;

      initController();
    }));

    describe('when initialized', function () {
      var expectedValue;

      beforeEach(function () {
        var taskOptions = TaskActivityOptionsData.map(function (type) {
          return { id: type.name, text: (type.label + ' (Task)'), icon: type.icon };
        });

        var documentOptions = DocumentActivityOptionsData.map(function (type) {
          return { id: type.name, text: (type.label + ' (Document)'), icon: type.icon };
        });

        expectedValue = taskOptions.concat(documentOptions);
      });

      it('stores the activity options after adding component type in label', function () {
        expect($scope.activityTypeOptions).toEqual(expectedValue);
      });
    });

    function initController () {
      $scope = $rootScope.$new();

      $controller('CaseTypeExtendedController', {
        $scope: $scope,
        crmApi: {},
        apiCalls: {},
        activityOptionsTask: { values: TaskActivityOptionsData },
        activityOptionsDocument: { values: DocumentActivityOptionsData }
      });

      $scope.$digest();
    }
  });
})();
