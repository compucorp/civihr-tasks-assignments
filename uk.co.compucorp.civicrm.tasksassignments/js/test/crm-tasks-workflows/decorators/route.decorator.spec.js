/* eslint-env jasmine */

(function () {
  'use strict';

  describe('RouteDecorator', function () {
    var $route, crmApiSpy;

    beforeEach(module('ngRoute', 'crm-tasks-workflows.decorators', function ($routeProvider) {
      // This happens before the configuration phase:
      $routeProvider.when('/caseType/:id', {
        controller: 'CaseTypeCtrl',
        resolve: {
          activityOptionsTask: function () {},
          activityOptionsDocument: function () {}
        }
      });
    }));

    beforeEach(inject(function (_$route_) {
      $route = _$route_;

      crmApiSpy = jasmine.createSpy('crmApi');
    }));

    describe('Extending CaseTypeCtrl', function () {
      var caseTypeRoute;

      beforeEach(function () {
        caseTypeRoute = $route.routes['/caseType/:id'];

        caseTypeRoute.resolve.activityOptionsTask(crmApiSpy);
        caseTypeRoute.resolve.activityOptionsDocument(crmApiSpy);
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
  });
})();
