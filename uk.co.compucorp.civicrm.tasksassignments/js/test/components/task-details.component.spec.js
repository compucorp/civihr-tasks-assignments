/* eslint-env amd, jasmine */

define([
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function () {
  'use strict';

  describe('TaskDetailsComponent', function () {
    var $componentController, $q, $rootScope, config, ctrl, taskService;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_$componentController_, _$q_, _$rootScope_,
      $httpBackend, _config_, _taskService_) {
      $componentController = _$componentController_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      config = _config_;
      taskService = _taskService_;

      // @TODO remove when API mocks are available.
      // This supresses all HTTP requests errors:
      $httpBackend.when('GET', /\/index.php/).respond({});
    }));

    beforeEach(function () {
      var task = {
        'id': '625',
        'activity_date_time': '2017-03-15T03:00:00.000Z',
        'activity_type_id': '13',
        'details': '<p>Test</p>',
        'subject': 'test',
        'status_id': '1',
        'assignee_contact_id': ['6'],
        'source_contact_id': '205',
        'target_contact_id': ['84'],
        'case_id': '',
        'resolved': false,
        'completed': false,
        'due': true
      };

      ctrl = $componentController('taskDetails', null, {
        task: task
      });
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

    describe('updateTask()', function () {
      describe('when saving the task succeeds', function () {
        beforeEach(function () {
          spyOn(taskService, 'save').and.callThrough();

          ctrl.updateTask();
        });

        it('saves the task', function () {
          expect(taskService.save).toHaveBeenCalledWith(ctrl.task);
        });
      });

      describe('when saving the task fails', function () {
        var errorMessage = 'error message';

        beforeEach(function () {
          spyOn(taskService, 'save').and.returnValue($q.reject(errorMessage));
          spyOn(CRM, 'alert');

          ctrl.updateTask();
          $rootScope.$digest();
        });

        it('displays an error message', function () {
          expect(CRM.alert).toHaveBeenCalledWith(errorMessage, 'Error', 'error');
        });
      });
    });
  });
});
