/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'

], function () {
  'use strict';

  describe('MainController', function () {
    var beforeHashQueryParams, $controller, $rootScope, $modal;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _beforeHashQueryParams_, _$uibModal_) {
      beforeHashQueryParams = _beforeHashQueryParams_;
      $controller = _$controller_;
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

      describe("when 'openModal' query param is 'task'", function () {
        beforeEach(function () {
          spyOn(beforeHashQueryParams, 'parse').and.returnValue({ 'openModal': 'task' });
          initController($controller);
        });

        it('opens Task Modal', function () {
          expect($modal.open).toHaveBeenCalled();
        });
      });

      describe("when 'openModal' query param is 'assignment'", function () {
        beforeEach(function () {
          spyOn(beforeHashQueryParams, 'parse').and.returnValue({ 'openModal': 'assignment' });
          initController($controller);
        });

        it('opens Assignment Modal', function () {
          expect($modal.open).toHaveBeenCalled();
        });
      });

      describe("when 'openModal' query param is 'document'", function () {
        beforeEach(function () {
          spyOn(beforeHashQueryParams, 'parse').and.returnValue({ 'openModal': 'document' });
          initController($controller);
        });

        it('opens Document Modal', function () {
          expect($modal.open).toHaveBeenCalled();
        });
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
