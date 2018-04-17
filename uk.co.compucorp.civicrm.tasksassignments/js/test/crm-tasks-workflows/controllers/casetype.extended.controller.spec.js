/* eslint-env jasmine */

(function () {
  'use strict';

  describe('CaseTypeExtendedController', function () {
    var $controller, $rootScope, $scope, crmApi, activityOptionsData, activityOptions;

    beforeEach(function () {
      module('crm-tasks-workflows.mocks', 'crm-tasks-workflows.controllers');
    });

    beforeEach(inject(function (_$controller_, _$rootScope_, _activityOptionsData_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      activityOptionsData = _activityOptionsData_;

      activityOptions = { values: activityOptionsData };

      initController(crmApi, activityOptions);
    }));

    it('returns the mapped data from api', function () {
      var expectedValues = activityOptionsData.map(function (type) {
        return { id: type.name, text: type.label, icon: type.icon };
      });

      expect($scope.activityTypeOptions).toEqual(expectedValues);
    });

    function initController (crmApi, activityOptions) {
      $scope = $rootScope.$new();

      $controller('CaseTypeExtendedController', {
        $scope: $scope,
        crmApi: {},
        apiCalls: {},
        activityOptions: activityOptions
      });

      $scope.$digest();
    }
  });
})();
