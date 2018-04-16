/* eslint-env jasmine */

(function () {
  'use strict';

  describe('CaseTypeExtendedController', function () {
    var $controller, $rootScope, $scope, $q, crmApi, crmApiData;

    beforeEach(function () {
      module('crm-tasks-workflows.mocks', 'crm-tasks-workflows.controllers');
    });

    beforeEach(inject(function (_$controller_, _$rootScope_, _$q_, _crmApi_, _crmApiData_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $q = _$q_;
      crmApi = _crmApi_;
      crmApiData = _crmApiData_;

      spyCrmApiAndReturn({
        values: crmApiData
      });

      initController(crmApi);
    }));

    it('calls the API to get CiviTask and CiviDocument Activity Types', function () {
      expect(crmApi).toHaveBeenCalledWith('OptionValue', 'get', {
        option_group_id: 'activity_type',
        component_id: {'IN': ['CiviTask', 'CiviDocument']},
        sequential: 1,
        options: {
          sort: 'name',
          limit: 0
        }
      });
    });

    it('returns the mapped data from api', function () {
      var expectedValues = crmApiData.map(function (type) {
        return { id: type.name, text: type.label, icon: type.icon };
      });

      expect($scope.activityTypeOptions).toEqual(expectedValues);
    });

    function initController (crmApi) {
      $scope = $rootScope.$new();

      $controller('CaseTypeExtendedController', {
        $scope: $scope,
        crmApi: crmApi
      });

      $scope.$digest();
    }

    function spyCrmApiAndReturn (returnData) {
      crmApi = jasmine.createSpy('crmApi', crmApi).and.callFake(function () {
        var deferred = $q.defer();

        deferred.resolve(returnData);

        return deferred.promise;
      });
    }
  });
})();
