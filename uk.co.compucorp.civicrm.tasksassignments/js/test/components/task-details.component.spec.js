/* eslint-env amd, jasmine */

define([
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function () {
  'use strict';

  describe('TaskDetailsComponent', function () {
    var $componentController, ctrl;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_$componentController_) {
      $componentController = _$componentController_;
    }));

    beforeEach(function () {
      ctrl = $componentController('taskDetails');
    });

    it('is defined', function () {
      expect(ctrl).toBeDefined();
    });
  });
});
