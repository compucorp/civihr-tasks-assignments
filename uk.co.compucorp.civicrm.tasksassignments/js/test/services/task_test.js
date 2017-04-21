define([
  'mocks/data/task',
  'tasks-assignments/app'
], function(TaskMock) {
  'use strict';

  describe('TaskService', function() {
    var Task, TaskService, $provide, $httpBackend;

    beforeEach(module('civitasks.appDashboard'));

    beforeEach(inject(function(_Task_, _TaskService_, _$httpBackend_) {
      Task = _Task_;
      TaskService = _TaskService_;
      $httpBackend = _$httpBackend_;
      spyOn(Task, 'save').and.callThrough();
    }));

    beforeEach(function() {
      $httpBackend.whenGET(/action=getoptions&entity=Task/).respond({});
      $httpBackend.whenGET(/action=getoptions&entity=Document/).respond({});
      $httpBackend.whenGET(/action=get&entity=CaseType/).respond({});
      $httpBackend.whenGET(/action=get&entity=contact/).respond({});
      $httpBackend.whenGET(/action=get&entity=Task/).respond({});
      $httpBackend.whenGET(/views.*/).respond({});
    });

    describe("save()", function() {
      beforeEach(function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/).respond({
          is_error: 0,
          values: [TaskMock.task]
        });
        TaskService.save(TaskMock.task);
        $httpBackend.flush();
      });

      it('makes call to save()', function() {
        expect(Task.save).toHaveBeenCalled();
      });

      it('calls save() with correct data', function() {
        var params = {
          action: 'create',
          entity: 'Task',
          sequential: 1,
          debug: true,
          json: Object({
            sequential: 1,
            debug: true,
            activity_date_time: '2017-04-21',
            assignee_contact_id: ['6'],
            source_contact_id: '205',
            target_contact_id: ['10'],
            details: '<p>Detailed description of the task</p>',
            case_id: null,
            activity_type_id: '88',
            subject: 'Sample Task Subject'
          })
        };

        expect(Task.save.calls.argsFor(0)[1]).toEqual(params);
      });

      it("calls request with correct Content-Type headers", function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/)
          .respond(function(method, url, data, headers, params) {
            expect(headers['Content-Type']).toEqual('application/x-www-form-urlencoded; charset=UTF-8');
            return {};
          });

        TaskService.save(TaskMock.task);
        $httpBackend.flush();
      });

      it("adds url encodning to task lists", function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/)
          .respond(function(method, url, data, headers, params) {
            expect(data).toEqual(TaskMock.urlEncodedData.onSave);
            return {};
          });

        TaskService.save(TaskMock.task);
        $httpBackend.flush();
      });
    });

    describe("assign()", function() {
      beforeEach(function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/).respond({
          is_error: 0,
          values: [TaskMock.task]
        });
        TaskService.assign(TaskMock.taskList, 1);
        $httpBackend.flush();
      });

      it('calls to $resource\'s save()', function() {
        expect(Task.save).toHaveBeenCalled();
      });

      it('makes call to save() with correct data', function() {
        var params = {
          action: 'copy_to_assignment',
          entity: 'Task',
          sequential: 1,
          debug: true,
          json: JSON.stringify({
            "id": TaskMock.taskList,
            "case_id": 1
          })
        };

        expect(Task.save.calls.argsFor(0)[1]).toEqual(params);
      });

      it("calls request with corect Content-Type header", function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/)
          .respond(function(method, url, data, headers, params) {
            expect(headers['Content-Type']).toEqual('application/x-www-form-urlencoded; charset=UTF-8');
            return {};
          });

        TaskService.assign(TaskMock.taskList, 1); // 1 =>addignmentId
        $httpBackend.flush();
      });

      it("adds url encodning to task list", function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/)
          .respond(function(method, url, data, headers, params) {
            expect(data).toEqual(TaskMock.urlEncodedData.onAssign);
            return {};
          });

        TaskService.assign(TaskMock.taskList, 1);
        $httpBackend.flush();
      });
    });

    describe("saveMultiple()", function() {
      beforeEach(function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/).respond({
          is_error: 0,
          values: [{}, {}]
        });
        TaskService.saveMultiple(TaskMock.taskList);
        $httpBackend.flush();
      });

      it('calls to $resource\'s save()', function() {
        expect(Task.save).toHaveBeenCalled();
      });

      it('makes calls save() with correct data', function() {
        var params = {
          action: 'create_multiple',
          entity: 'Task',
          sequential: 1,
          debug: true,
          json: JSON.stringify({
            "task": TaskMock.taskList
          })
        };

        expect(Task.save.calls.argsFor(0)[1]).toEqual(params);
      });

      it("calls request with Content-Typeheader", function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/)
          .respond(function(method, url, data, headers, params) {
            expect(headers['Content-Type']).toEqual('application/x-www-form-urlencoded; charset=UTF-8');
            return {};
          });

        TaskService.saveMultiple(TaskMock.taskList);
        $httpBackend.flush();
      });

      it("adds url encodning to task lists", function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/)
          .respond(function(method, url, data, headers, params) {
            expect(data).toEqual(TaskMock.urlEncodedData.onSaveMultiple);
            return {};
          });

        TaskService.saveMultiple(TaskMock.taskList);
        $httpBackend.flush();
      });
    });

    describe("sendReminder()", function() {
      beforeEach(function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/).respond({
          is_error: 0,
          values: true
        });
        TaskService.sendReminder(1, TaskMock.remonderNode);
        $httpBackend.flush();
      });

      it('calls to $resource\'s save()', function() {
        expect(Task.save).toHaveBeenCalled();
      });

      it('makes call to save() with correct data', function() {
        var params = {
          action: 'sendreminder',
          entity: 'Task',
          sequential: 1,
          debug: true,
          activity_id: 1,
          json: JSON.stringify({
            "notes": TaskMock.remonderNode
          })
        };

        expect(Task.save.calls.argsFor(0)[1]).toEqual(params);
        TaskService.sendReminder(1, TaskMock.remonderNode);
        $httpBackend.flush();
      });

      it("calls request with Content-Type header", function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/)
          .respond(function(method, url, data, headers, params) {
            expect(headers['Content-Type']).toEqual('application/x-www-form-urlencoded; charset=UTF-8');
            return {};
          });

        TaskService.sendReminder(1, TaskMock.remonderNode);
        $httpBackend.flush();
      });

      it("adds url encodning to notes data", function() {
        $httpBackend.whenPOST(/rest&action=get&entity=Task/)
          .respond(function(method, url, data, headers, params) {
            console.log(data);
            expect(data).toEqual(TaskMock.urlEncodedData.onSendReminder);
            return {};
          });

        TaskService.sendReminder(1, TaskMock.remonderNote);
        $httpBackend.flush();
      });
    });
  });
});
