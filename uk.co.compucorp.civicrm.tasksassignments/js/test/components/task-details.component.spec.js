/* eslint-env amd, jasmine */

define([
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function () {
  'use strict';

  describe('TaskDetailsComponent', function () {
    var $componentController, config, ctrl;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_$componentController_, _config_) {
      $componentController = _$componentController_;
      config = _config_;
    }));

    beforeEach(function () {
      ctrl = $componentController('taskDetails');
    });

    it('is defined', function () {
      expect(ctrl).toBeDefined();
    });

    it('stores the contacts\' URL', function () {
      expect(ctrl.CONTACTS_URL).toBe(config.url.CONTACT);
    });
  });
});
