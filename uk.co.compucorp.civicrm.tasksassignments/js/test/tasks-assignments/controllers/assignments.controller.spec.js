/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-assignments/dashboard/tasks-assignments.dashboard.module'
], function () {
  'use strict';

  describe('AssignmentsController', function () {
    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function ($controller, $rootScope) {
      $controller('AssignmentsController', { $scope: $rootScope.$new() });
    }));

    it('is a simple test', function () {
      expect(true).toBe(true);
    });
  });
});
