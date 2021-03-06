/* eslint-env jasmine */

(function () {
  'use strict';

  describe('RouteDecorator', function () {
    var $injector, $route, crmApiSpy, customFieldIds;

    beforeEach(module('ngRoute', 'crm-tasks-workflows.decorators', function ($routeProvider, $provide) {
      crmApiSpy = jasmine.createSpy('crmApi');

      $provide.value('crmApi', crmApiSpy);
      $provide.value('customFieldIds', {
        'caseType.category': 80
      });

      // mocks the route configuration before the decorator executes:
      $routeProvider
        .when('/caseType/:id', {
          controller: 'CaseTypeCtrl',
          resolve: {
            activityOptionsTask: resolverToBeReplaced,
            activityOptionsDocument: resolverToBeReplaced
          }
        })
        .when('/caseType', {
          controller: 'CaseTypeListCtrl',
          resolve: {
            caseTypes: resolverToBeReplaced
          }
        });

      // mock resolve function that should be replaced by the decorator:
      function resolverToBeReplaced () {}
    }));

    beforeEach(inject(function (_$injector_, _$route_, _customFieldIds_) {
      $injector = _$injector_;
      $route = _$route_;
      customFieldIds = _customFieldIds_;
    }));

    describe('Extending CaseTypeCtrl', function () {
      var caseTypeRoute;

      beforeEach(function () {
        caseTypeRoute = $route.routes['/caseType/:id'];

        $injector.invoke(caseTypeRoute.resolve.activityOptionsTask);
        $injector.invoke(caseTypeRoute.resolve.activityOptionsDocument);
      });

      it('replaces the original controller for the extended one', function () {
        expect(caseTypeRoute.controller).toBe('CaseTypeExtendedController');
      });

      it('resolves activity tasks', function () {
        expect(crmApiSpy).toHaveBeenCalledWith('OptionValue', 'get', {
          option_group_id: 'activity_type',
          component_id: 'CiviTask',
          sequential: 1,
          options: { sort: 'name', limit: 0 }
        });
      });

      it('resolves activity documents', function () {
        expect(crmApiSpy).toHaveBeenCalledWith('OptionValue', 'get', {
          option_group_id: 'activity_type',
          component_id: 'CiviDocument',
          sequential: 1,
          options: { sort: 'name', limit: 0 }
        });
      });
    });

    describe('Extending CaseTypeListCtrl', function () {
      var caseTypeListRoute, expectedFilters;

      beforeEach(function () {
        var caseTypeCategoryField = 'custom_' + customFieldIds['caseType.category'];
        caseTypeListRoute = $route.routes['/caseType'];
        expectedFilters = { options: { limit: 0 } };
        expectedFilters[ caseTypeCategoryField ] = 'Workflow';

        $injector.invoke(caseTypeListRoute.resolve.caseTypes);
      });

      it('resolves a list of workflow case types', function () {
        expect(crmApiSpy).toHaveBeenCalledWith('CaseType', 'get', expectedFilters);
      });
    });
  });
})();
