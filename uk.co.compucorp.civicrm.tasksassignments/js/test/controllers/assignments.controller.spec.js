/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-assignments/app'
], function () {
  'use strict';

  describe('AssignmentsCtrl', function () {
    beforeEach(module('task-assignments.dashboard'));
    beforeEach(inject(function ($controller, $rootScope) {
      $controller('AssignmentsCtrl', { $scope: $rootScope.$new() });
    }));

    it('is a simple test', function () {
      expect(true).toBe(true);
    });
  });
});
