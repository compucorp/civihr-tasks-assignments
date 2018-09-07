/* eslint-env amd, jasmine */

define([
  'common/angular',
  'mocks/fabricators/task.fabricator',
  'common/angularMocks',
  'tasks-assignments/dashboard/tasks-assignments.dashboard.module'
], function (angular, taskFabricator) {
  'use strict';

  describe('TaskListController', function () {
    var $scope, contactService, taskService, controller;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function ($controller, $rootScope, _contactService_, _taskService_) {
      $scope = $rootScope.$new();
      contactService = _contactService_;
      taskService = _taskService_;

      controller = $controller('TaskListController', {
        $scope: $scope,
        taskList: taskFabricator.list()
      });
    }));

    describe('cacheContact()', function () {
      var contactToCacheId = '3';

      beforeEach(function () {
        spyOn(contactService, 'updateCache');
        controller.contacts = mockedTempCachedContacts();
        controller.cacheContact(contactToCacheId);
      });

      it('calls the contactService', function () {
        expect(contactService.updateCache).toHaveBeenCalled();
      });

      it('passes to the cache the expected object', function () {
        expect(contactService.updateCache).toHaveBeenCalledWith({
          '3': {
            contact_id: '3',
            contact_type: 'type 1',
            sort_name: 'temp3',
            display_name: 'temp3',
            email: 'temp3@example.org'
          }
        });
      });
    });

    describe('updateTask()', function () {
      var task, updateObj, saveObj;

      beforeEach(function () {
        spyOn(taskService, 'save').and.callThrough();

        task = {
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

        updateObj = {
          subject: 'Test 2'
        };

        saveObj = angular.extend({}, task, updateObj);

        controller.updateTask(task, updateObj);
      });

      it('calls taskService with the correct object', function () {
        expect(taskService.save).toHaveBeenCalledWith(saveObj);
      });
    });

    describe('filterByDateField()', function () {
      var filteredTaskList;

      describe('filtering tasks by due date in between the date range', function () {
        beforeEach(function () {
          controller.filterParams.dateRange = {
            from: '2017-04-10 00:00:00',
            until: '2017-04-20 00:00:00'
          };

          filteredTaskList = controller.filterByDateField('dateRange');
        });

        it('returns filtered tasks by due date', function () {
          expect(filteredTaskList.length).toBe(3);
        });
      });

      describe('filtering tasks by due date not in between the date range', function () {
        beforeEach(function () {
          controller.filterParams.dateRange = {
            from: '2017-04-23 00:00:00',
            until: '2017-04-25 00:00:00'
          };

          filteredTaskList = controller.filterByDateField('dateRange');
        });

        it('does not return filtered tasks', function () {
          expect(filteredTaskList.length).toBe(0);
        });
      });
    });

    function mockedTempCachedContacts () {
      return [
        {
          id: '1',
          icon_class: 'type 1',
          label: 'temp1',
          description: ['temp1@example.org']
        },
        {
          id: '2',
          icon_class: 'type 2',
          label: 'temp2',
          description: ['temp2@example.org']
        },
        {
          id: '3',
          icon_class: 'type 1',
          label: 'temp3',
          description: ['temp3@example.org']
        }
      ];
    }
  });
});
