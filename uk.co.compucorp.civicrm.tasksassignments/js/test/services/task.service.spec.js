/* eslint-env amd, jasmine */

define([
  'mocks/fabricators/task.fabricator',
  'mocks/data/task.data',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (taskFabricator, taskMock) {
  'use strict';

  var fakeTask = taskFabricator.single();
  var fakeTaskList = taskFabricator.list();
  var fakeActivityTypes = taskFabricator.activityTypes();
  var fakeTaskStatus = taskFabricator.taskStatus();
  var fakeReminderNote = taskFabricator.reminderNote();

  var mockBackendCalls = function ($httpBackend) {
    $httpBackend.whenGET(/action=getoptions&entity=Document/).respond({});
    $httpBackend.whenGET(/action=get&entity=CaseType/).respond({});
    $httpBackend.whenGET(/action=get&debug=true&entity=contact/).respond({});
    $httpBackend.whenGET(/action=get&debug=true&entity=Task/).respond({});
    $httpBackend.whenGET(/action=getoptions&debug=true&entity=Document/).respond({});
    $httpBackend.whenGET(/views.*/).respond({});
  };

  describe('Task', function () {
    var Task, $httpBackend, $httpParamSerializer, requestBody;
    var request = {};

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_Task_, _$httpParamSerializer_, _$httpBackend_) {
      Task = _Task_;
      $httpBackend = _$httpBackend_;
      $httpParamSerializer = _$httpParamSerializer_;

      spyOn(Task, 'save').and.callThrough();
    }));

    beforeEach(function () {
      mockBackendCalls($httpBackend);
      $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond({});
      $httpBackend.whenPOST(/action=create&debug=true&entity=Task/).respond(function (method, url, data, headers) {
        request.method = method;
        request.headers = headers;
        request.data = data;

        return [200];
      });
    });

    describe('save()', function () {
      beforeEach(function () {
        Task.save({
          action: 'create'
        }, {
          json: fakeTask || {}
        });

        requestBody = Task.save.calls.argsFor(0)[1];
        $httpBackend.flush();
      });

      it('makes request with Content-Type as application/x-www-form-urlencoded; charset=UTF-8', function () {
        expect(request.headers['Content-Type']).toEqual('application/x-www-form-urlencoded; charset=UTF-8');
      });

      it('adds url encoding to Task list', function () {
        expect(request.data).toEqual($httpParamSerializer({ json: fakeTask }));
      });

      it('calls save() as POST request with Task data', function () {
        expect(request.method).toEqual('POST');
        expect(requestBody.json).toEqual(fakeTask);
      });
    });
  });

  describe('TaskService', function () {
    var TaskService, $httpBackend, $q, promise;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_TaskService_, _$httpBackend_, _$q_) {
      TaskService = _TaskService_;
      $httpBackend = _$httpBackend_;
      $q = _$q_;
    }));

    beforeEach(function () {
      mockBackendCalls($httpBackend);
    });

    afterEach(function () {
      $httpBackend.flush();
    });

    describe('save()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond({});
        $httpBackend.whenPOST(/action=create&debug=true&entity=Task/).respond(taskMock.onSave);
      });

      it('returns saved Task on saving task', function () {
        TaskService.save(fakeTask).then(function (data) {
          expect(data).toEqual(fakeTask);
        });
      });
    });

    describe('assign()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond({});
        $httpBackend.whenPOST(/action=copy_to_assignment&debug=true&entity=Task/).respond(taskMock.onAssign);
      });

      it('returns list of assigned tasks on task assign', function () {
        TaskService.assign(fakeTaskList, 1).then(function (data) {
          expect(data).toEqual(fakeTaskList);
        });
      });
    });

    describe('saveMultiple()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond({});
        $httpBackend.whenPOST(/action=create_multiple&debug=true&entity=Task/).respond(taskMock.onSaveMultiple);
      });

      it('returns saved task list on saving multiple tasks', function () {
        TaskService.saveMultiple(fakeTaskList).then(function (data) {
          expect(data).toEqual(fakeTaskList);
        });
      });
    });

    describe('sendReminder()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond({});
        $httpBackend.whenPOST(/action=sendreminder&debug=true&entity=Task/).respond(taskMock.onSendReminder);
      });

      it('returns reminder sent status on sending reminder for a task', function () {
        TaskService.sendReminder(1, fakeReminderNote).then(function (data) {
          expect(data.values).toEqual(true);
        });
      });
    });

    describe('getActivityTypes()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond(taskMock.onGetOptions.activityTypes);
        promise = $q.all({
          taskType: TaskService.getActivityTypes()
        });
      });

      it('returns promise with array of list of activity types', function () {
        promise.then(function (options) {
          expect(options.taskType.obj).toBeDefined();
          expect(options.taskType.arr).toEqual(fakeActivityTypes);
        });
      });
    });

    describe('getTaskStatus()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond(taskMock.onGetOptions.taskStatus);
        promise = $q.all({
          taskStatus: TaskService.getTaskStatus()
        });
      });

      it('returns promise with array of list of task status', function () {
        promise.then(function (options) {
          expect(options.taskStatus.obj).toBeDefined();
          expect(options.taskStatus.arr).toEqual(fakeTaskStatus);
        });
      });
    });

    describe('getOptions()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task&json=%7B%22field%22:%22activity_type_id/).respond(taskMock.onGetOptions.activityTypes);
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task&json=%7B%22field%22:%22status_id/).respond(taskMock.onGetOptions.taskStatus);
        promise = $q.resolve(TaskService.getOptions());
      });

      it('returns promise with array of list of activity types and task status', function () {
        promise.then(function (options) {
          expect(options.taskType.arr).toEqual(fakeActivityTypes);
          expect(options.taskStatus.arr).toEqual(fakeTaskStatus);
        });
      });
    });
  });
});
