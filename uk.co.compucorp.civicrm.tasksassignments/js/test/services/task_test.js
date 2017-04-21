define([
  'mocks/data/task',
  'tasks-assignments/app'
], function(TaskMock) {
  'use strict';

  describe('Task', function() {
    var Task, TaskService, $httpBackend, requestBody, request = {};

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

    describe('$resource.save()', function() {
      describe('when calling TaskService.save()', function () {
        beforeEach(function() {
          $httpBackend.whenPOST(/action=create&entity=Task/).respond(function(method, url, data, headers, params) {
            request.method  = method;
            request.headers = headers;
            request.data = data;

            return [200];
          });

          TaskService.save(TaskMock.task);
          $httpBackend.flush();
        });

        it('makes call to save()', function() {
          expect(Task.save).toHaveBeenCalled();
        });

        it('makes request with Content-Type as application/x-www-form-urlencoded; charset=UTF-8', function() {
          expect(request.headers['Content-Type']).toEqual('application/x-www-form-urlencoded; charset=UTF-8');
        });

        it('adds url encoding to Task list', function () {
          expect(request.data).toEqual(TaskMock.urlEncodedData.onSave);
        });

        it('calls save() as POST request with Task data', function() {
          requestBody = Task.save.calls.argsFor(0)[1];

          expect(request.method).toEqual('POST');
          expect(requestBody.json).toEqual(TaskMock.task);
        });
      });

      describe("when calling TaskService.assign()", function() {
        beforeEach(function() {
          $httpBackend.whenPOST(/action=copy_to_assignment&entity=Task/).respond(function(method, url, data, headers, params) {
            request.headers = headers;
            request.data = data;

            return [200];
          });

          TaskService.assign(TaskMock.taskList, 1);
          $httpBackend.flush();
        });

        it('calls to save() with Task list', function() {
          var params = {
            json: {
              id: TaskMock.taskList,
              case_id: 1
            }
          };
          requestBody = Task.save.calls.argsFor(0)[1];

          expect(requestBody.json).toEqual(params.json);
        });
      });

      describe("when calling TaskService.saveMultiple()", function() {
        beforeEach(function() {
          $httpBackend.whenPOST(/action=create_multiple&entity=Task/).respond(function(method, url, data, headers, params) {
            request.headers = headers;
            request.data = data;

            return [200];
          });

          TaskService.saveMultiple(TaskMock.taskList);
          $httpBackend.flush();
        });

        it('calls to save() with Task list', function() {
          var params = {
            json: {
              task: TaskMock.taskList
            }
          };
          requestBody = Task.save.calls.argsFor(0)[1],

          expect(requestBody.json).toEqual(params.json);
        });
      });

      describe("when calling TaskService.sendReminder()", function() {
        beforeEach(function() {
          $httpBackend.whenPOST(/action=sendreminder&entity=Task/).respond(function(method, url, data, headers, params) {
            request.headers = headers;
            request.data = data;

            return [200];
          });

          TaskService.sendReminder(1, TaskMock.reminderNote);
          $httpBackend.flush();
        });

        it('calls to save() with Reminder Note', function() {
          var params = {
            json: {
              notes: TaskMock.reminderNote
            }
          };
          requestBody = Task.save.calls.argsFor(0)[1],

          expect(requestBody.json).toEqual(params.json);
        });
      });
    });
  });

  describe('TaskService', function() {
    var Task, TaskService, $httpBackend, request = {};;

    beforeEach(module('civitasks.appDashboard'));

    beforeEach(inject(function(_TaskService_, _$httpBackend_) {
      TaskService = _TaskService_;
      $httpBackend = _$httpBackend_;
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
        $httpBackend.whenPOST(/action=create&entity=Task/).respond(function() {
          return [200, TaskMock.response.onSave];
        });
      });

      it('responds correct Task details', function (){
        TaskService.save(TaskMock.task).then(function(data){
          expect(data).toEqual(TaskMock.task);
        });

        $httpBackend.flush();
      })
    });

    describe("assign()", function() {
      beforeEach(function() {
        $httpBackend.whenPOST(/action=copy_to_assignment&entity=Task/).respond(function() {
          return [200, TaskMock.response.onAssign];
        });
      });

      it('responds assigned Task List', function (){
        TaskService.assign(TaskMock.taskList, 1).then(function(data){
          expect(data).toEqual(TaskMock.taskList);
        });

        $httpBackend.flush();
      });
    });

    describe("saveMultiple()", function() {
      beforeEach(function() {
        $httpBackend.whenPOST(/action=create_multiple&entity=Task/).respond(function() {
          return [200, TaskMock.response.onSaveMultiple];
        });
      });

      it('responds saved Task List', function (){
        TaskService.saveMultiple(TaskMock.taskList).then(function(data){
          expect(data).toEqual(TaskMock.response.onSaveMultiple.values);
        });

        $httpBackend.flush();
      });
    });

    describe("sendReminder()", function() {
      beforeEach(function() {
        $httpBackend.whenPOST(/action=sendreminder&entity=Task/).respond(function() {
          return [200, TaskMock.response.onSendReminder];
        });
      });

      it('responds with reminder sent status', function (){
        TaskService.sendReminder(1, TaskMock.reminderNote).then(function(data){
          expect(data.values).toEqual(TaskMock.response.onSendReminder.values);
        });

        $httpBackend.flush();
      });
    });
  });
});
