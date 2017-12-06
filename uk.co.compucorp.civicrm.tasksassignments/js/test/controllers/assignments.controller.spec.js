/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function () {
  'use strict';

  describe('AssignmentsCtrl', function () {
    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function ($controller, $rootScope) {
      $controller('AssignmentsCtrl', { $scope: $rootScope.$new() });
    }));

    it('is a simple test', function () {
      expect(true).toBe(true);
    });
  });
});
