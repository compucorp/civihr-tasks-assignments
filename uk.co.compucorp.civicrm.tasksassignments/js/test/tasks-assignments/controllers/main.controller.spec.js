/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'common/angularMocks',
  'common/models/option-group',
  'common/models/session.model',
  'tasks-assignments/dashboard/tasks-assignments.dashboard.module'
], function (_) {
  'use strict';

  describe('MainController', function () {
    var $controller, $log, $modal, $q, $rootScope, $scope, beforeHashQueryParams,
      OptionGroup, notificationService, Session, taskService;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_$controller_, $httpBackend, _$log_, _$q_, _$rootScope_,
      _beforeHashQueryParams_, _$uibModal_, config, _OptionGroup_, _notificationService_,
      _Session_, _taskService_) {
      beforeHashQueryParams = _beforeHashQueryParams_;
      $controller = _$controller_;
      $log = _$log_;
      $q = _$q_;
      $modal = _$uibModal_;
      $rootScope = _$rootScope_;
      OptionGroup = _OptionGroup_;
      notificationService = _notificationService_;
      Session = _Session_;
      taskService = _taskService_;

      spyOn($modal, 'open').and.callThrough();

      // Avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});
      $httpBackend.whenGET(/\.html/).respond('');
    }));

    describe('init()', function () {
      beforeEach(function () {
        initController($controller);
      });

      it('defines modalAssignment()', function () {
        expect($rootScope.modalAssignment).toBeDefined();
      });

      it('defines modalDocument()', function () {
        expect($rootScope.modalDocument).toBeDefined();
      });

      it('defines modalTask()', function () {
        expect($rootScope.modalTask).toBeDefined();
      });
    });

    describe('automatic opening of a modal', function () {
      describe('when there is a "openModal" query string param', function () {
        describe('when the param value is "task"', function () {
          beforeEach(function () {
            mockQueryStringAndInit({ 'openModal': 'task' });
          });

          it('opens the task modal', function () {
            expect(isModalControllerOfType('Task')).toBe(true);
          });
        });

        describe('when the param value is "document"', function () {
          beforeEach(function () {
            mockQueryStringAndInit({ 'openModal': 'document' });
          });

          it('opens the document modal', function () {
            expect(isModalControllerOfType('Document')).toBe(true);
          });
        });

        describe('when the param value is "assignment"', function () {
          describe('basic tests', function () {
            beforeEach(function () {
              mockQueryStringAndInit({ 'openModal': 'assignment' });
            });

            it('opens the assignment modal', function () {
              expect(isModalControllerOfType('Assignment')).toBe(true);
            });
          });

          describe('when there is a "caseTypeId" query string param', function () {
            var caseTypeId = '123';

            beforeEach(function () {
              mockQueryStringAndInit({ 'openModal': 'assignment', 'caseTypeId': caseTypeId });
            });

            it('opens the assignment modal with the given case type id', function () {
              var dataPassed = $modal.open.calls.argsFor(0)[0].resolve.data();

              expect(dataPassed.case_type_id).toBe(caseTypeId);
            });
          });
        });

        describe('when the param value is none of the above', function () {
          beforeEach(function () {
            spyOn($log, 'warn');
            mockQueryStringAndInit({ 'openModal': 'foobar' });
          });

          it('does not automatically open a modal', function () {
            expect($modal.open).not.toHaveBeenCalled();
          });

          it('outputs a warning message on the console', function () {
            expect($log.warn).toHaveBeenCalled();
          });
        });
      });

      describe('when there is no "openModal" query string param', function () {
        beforeEach(function () {
          mockQueryStringAndInit({ 'foo': 'bar' });
        });

        it('does not automatically open a modal', function () {
          expect($modal.open).not.toHaveBeenCalled();
        });
      });

      /**
       * Checks if the controller of the modal just opened is of the given type
       * (= if the type is in the name of the controller)
       *
       * @param {String} type
       * @return {Boolean}
       */
      function isModalControllerOfType (type) {
        var ctrlName = $modal.open.calls.argsFor(0)[0].controller;

        return _.includes(ctrlName, type);
      }

      /**
       * Mocks the query string by faking the value returned by the
       * beforeHashQueryParams, and then it initializes the controller
       *
       * @param {Object} queryStringParams
       */
      function mockQueryStringAndInit (queryStringParams) {
        spyOn(beforeHashQueryParams, 'parse').and.returnValue(queryStringParams);
        initController($controller);
      }
    });

    describe('when opening the Assignment Modal', function () {
      var activityData, defaultAssigneeOptionsPromise, sessionPromise;

      beforeEach(function () {
        activityData = { id: 123 };
        sessionPromise = $q.resolve({ contactId: 123 });
        defaultAssigneeOptionsPromise = $q.resolve([{ id: 123 }]);

        spyOn(Session, 'get').and.returnValue(sessionPromise);
        spyOn(OptionGroup, 'valuesOf').and.returnValue(defaultAssigneeOptionsPromise);
        initController();
        $rootScope.modalAssignment(activityData);
      });

      it('requests the session data', function () {
        expect(Session.get).toHaveBeenCalled();
      });

      it('requests the default assignee types for activities', function () {
        expect(OptionGroup.valuesOf).toHaveBeenCalledWith('activity_default_assignee');
      });

      it('resolves the activity data', function () {
        expect(getModalResolvedData('data')).toBe(activityData);
      });

      it('resolves the session data', function () {
        expect(getModalResolvedData('session')).toBe(sessionPromise);
      });

      it('resolves the default assignee options', function () {
        expect(getModalResolvedData('defaultAssigneeOptions'))
          .toBe(defaultAssigneeOptionsPromise);
      });

      function getModalResolvedData (dataName) {
        var resolve = $modal.open.calls.argsFor(0)[0].resolve;

        if (resolve && resolve[dataName]) {
          return resolve[dataName]();
        }
      }
    });

    describe('displaying the case closed message', function () {
      describe('when the last task is marked as completed', function () {
        var caseClosedMessage, caseData, taskData;

        beforeEach(function () {
          var contactData = { display_name: 'Justin Tyme' };
          var caseTitle = 'Joining';

          caseData = {
            'case_id.case_type_id.title': caseTitle,
            'case_id.status_id.name': 'Closed'
          };
          taskData = {
            id: _.uniqueId(),
            case_id: _.uniqueId(),
            target_contact_id: [ _.uniqueId() ]
          };
          caseClosedMessage = 'All tasks in the ' + caseTitle +
            ' workflow for ' + contactData.display_name + ' have been completed. Good work!';
          // stores the task's target contact in the cache:
          $rootScope.cache.contact.obj[taskData.target_contact_id[0]] = contactData;

          spyOn(notificationService, 'success');
          spyOn(taskService, 'get').and.returnValue($q.resolve([caseData]));
          initController();
          $scope.$emit('taskFormSuccess', {}, taskData);
          $scope.$digest();
        });

        it('fetches the case status and title', function () {
          expect(taskService.get).toHaveBeenCalledWith({
            id: taskData.id,
            return: [
              'case_id.case_type_id.title',
              'case_id.status_id.name'
            ]
          });
        });

        it('displays a success message', function () {
          expect(notificationService.success).toHaveBeenCalledWith('Success', caseClosedMessage);
        });
      });
    });

    /**
     * Initializes MainController
     */
    function initController () {
      $scope = $rootScope.$new();

      $controller('MainController', {
        beforeHashQueryParams: beforeHashQueryParams,
        $rootScope: $rootScope,
        $scope: $scope,
        $uibModal: $modal
      });
    }
  });
});
