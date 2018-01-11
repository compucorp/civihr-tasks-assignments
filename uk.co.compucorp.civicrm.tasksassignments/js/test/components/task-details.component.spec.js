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

    it('stores the permission value for deleting tasks', function () {
      expect(ctrl.CAN_DELETE_TASKS).toBe(config.permissions.allowDelete);
    });

    describe('Task Date', function () {
      var expectedDate;

      beforeEach(function () {
        var date = '2000-01-01T00:00:00';
        var task = {
          activity_date_time: date
        };

        expectedDate = new Date(date);
        ctrl = $componentController('taskDetails', null, {
          task: task
        });
      });

      it('converts the activity string date into a Date object', function () {
        expect(ctrl.task.activity_date_time).toEqual(expectedDate);
      });
    });
  });
});
