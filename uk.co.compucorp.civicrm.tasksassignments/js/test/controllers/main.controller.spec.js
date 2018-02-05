/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function () {
  'use strict';

  describe('MainController', function () {
    var beforeHashQueryParams, $controller, $log, $rootScope, $modal;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_$controller_, _$log_, _$rootScope_, _beforeHashQueryParams_, _$uibModal_) {
      beforeHashQueryParams = _beforeHashQueryParams_;
      $controller = _$controller_;
      $log = _$log_;
      $modal = _$uibModal_;
      $rootScope = _$rootScope_;

      spyOn($modal, 'open').and.callThrough();
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
            beforeEach(function () {
              mockQueryStringAndInit({ 'openModal': 'assignment' });
            });

            it('opens the assignment modal', function () {
              expect(isModalControllerOfType('Assignment')).toBe(true);
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
        function mockQueryStringAndInit(queryStringParams) {
          spyOn(beforeHashQueryParams, 'parse').and.returnValue(queryStringParams);
          initController($controller);
        }
      });
    });

    /**
     * Initializes MainController
     */
    function initController () {
      $controller('MainController', {
        beforeHashQueryParams: beforeHashQueryParams,
        $rootScope: $rootScope,
        $scope: $rootScope.$new(),
        $uibModal: $modal
      });
    }
  });
});
