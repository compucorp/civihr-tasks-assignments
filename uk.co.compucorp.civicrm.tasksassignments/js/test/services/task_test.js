define([
  'mocks/data/task',
  'mocks/fabricators/task',
  'tasks-assignments/app'
], function(taskMock, taskFabricator) {
  'use strict';

  var taskMock = taskMock;
  var fakeTask = taskFabricator.single();
  var fakeTaskList  = taskFabricator.list();
  var fakeReminderNote  = taskFabricator.reminderNote();

  var mockBackendCalls = function ($httpBackend) {
    $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond({});
    $httpBackend.whenGET(/action=getoptions&entity=Document/).respond({});
    $httpBackend.whenGET(/action=get&entity=CaseType/).respond({});
    $httpBackend.whenGET(/action=get&entity=contact/).respond({});
    $httpBackend.whenGET(/action=get&debug=true&entity=Task/).respond({});
    $httpBackend.whenGET(/views.*/).respond({});
  }

  describe('Task', function () {
    var Task, $httpBackend, $httpParamSerializer, requestBody, request = {};

    beforeEach(module('civitasks.appDashboard'));

    beforeEach(inject(function (_Task_, _$httpParamSerializer_, _$httpBackend_) {
      Task = _Task_;
      $httpBackend = _$httpBackend_;
      $httpParamSerializer = _$httpParamSerializer_

      spyOn(Task, 'save').and.callThrough();
    }));

    beforeEach(function () {
      mockBackendCalls($httpBackend);
    });

    describe('save()', function () {
      beforeEach(function () {
        $httpBackend.whenPOST(/action=create&debug=true&entity=Task/).respond(function (method, url, data, headers) {
          request.method = method;
          request.headers = headers;
          request.data = data;

          return [200];
        });

        Task.save({
          action: 'create'
        }, {
          json: fakeTask || {}
        });

        $httpBackend.flush();
      });

      it('makes request with Content-Type as application/x-www-form-urlencoded; charset=UTF-8', function () {
        expect(request.headers['Content-Type']).toEqual('application/x-www-form-urlencoded; charset=UTF-8');
      });

      it('adds url encoding to Task list', function () {
        expect(request.data).toEqual($httpParamSerializer({ json: fakeTask }));
      });

      it('calls save() as POST request with Task data', function () {
        requestBody = Task.save.calls.argsFor(0)[1];

        expect(request.method).toEqual('POST');
        expect(requestBody.json).toEqual(fakeTask);
      });
    });
  });

  describe('TaskService', function () {
    var TaskService, $httpBackend;

    beforeEach(module('civitasks.appDashboard'));

    beforeEach(inject(function (_TaskService_, _$httpBackend_) {
      TaskService = _TaskService_;
      $httpBackend = _$httpBackend_;
    }));

    beforeEach(function () {
      mockBackendCalls($httpBackend);
    });

    describe("save()", function () {
      beforeEach(function () {
        $httpBackend.whenPOST(/action=create&debug=true&entity=Task/).respond(function () {
          return [200, taskMock.onSave];
        });
      });

      it('returns saved Task on saving task', function () {
        TaskService.save(fakeTask).then(function (data) {
          expect(data).toEqual(fakeTask);
        });

        $httpBackend.flush();
      })
    });

    describe("assign()", function () {
      beforeEach(function () {
        $httpBackend.whenPOST(/action=copy_to_assignment&debug=true&entity=Task/).respond(function () {
          return [200, taskMock.onAssign];
        });
      });

      it('returns list of assigned tasks on task assign', function () {
        TaskService.assign(fakeTaskList, 1).then(function (data) {
          expect(data).toEqual(fakeTaskList);
        });

        $httpBackend.flush();
      });
    });

    describe("saveMultiple()", function () {
      beforeEach(function() {
        $httpBackend.whenPOST(/action=create_multiple&debug=true&entity=Task/).respond(function () {
          return [200, taskMock.onSaveMultiple];
        });
      });

      it('returns saved task list on saving multiple tasks', function () {
        TaskService.saveMultiple(fakeTaskList).then(function (data) {
          expect(data).toEqual(fakeTaskList);
        });

        $httpBackend.flush();
      });
    });

    describe("sendReminder()", function () {
      beforeEach(function () {
        $httpBackend.whenPOST(/action=sendreminder&debug=true&entity=Task/).respond(function () {
          return [200, taskMock.onSendReminder];
        });
      });

      it('returns reminder sent status on sending reminder for a task', function () {
        TaskService.sendReminder(1, fakeReminderNote).then(function (data) {
          expect(data.values).toEqual(true);
        });

        $httpBackend.flush();
      });
    });
  });
});
