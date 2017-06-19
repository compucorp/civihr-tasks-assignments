/* eslint-env amd, jasmine */

define([
  'common/angular',
  'mocks/document',
  'tasks-assignments/app'
], function (angular, documentMock) {
  'use strict';

  describe('DocumentListCtrl', function () {
    var $controller, $rootScope, DocumentService, $scope;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _DocumentService_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      DocumentService = _DocumentService_;
    }));

    beforeEach(function (){
      spyOn(DocumentService, 'get').and.callFake(fakePromise([]));
      spyOn(DocumentService, 'cacheContactsAndAssignments').and.callFake(fakePromise([]));
    });

    describe('init()', function () {
      beforeEach(function () {
        initController();
      });

      it('calls document service to cache contacts and assigments', function () {
        expect(DocumentService.cacheContactsAndAssignments).toHaveBeenCalled();
      });
    });

    describe('$scope.loadDocumentsResolved', function () {
      beforeEach(function () {
        initController();
        $scope.loadDocumentsResolved();
      });

      it('calls document service to document list', function () {
        expect(DocumentService.get).toHaveBeenCalled();
      });

      it('calls document service to cache contacts and assignments', function () {
          expect(DocumentService.cacheContactsAndAssignments).toHaveBeenCalled();
      });

      it('marks relolved section as loaded', function () {
        expect($scope.listResolvedLoaded).toBe(true);
      });
    });

    function initController (scopeValues) {
      $controller('DocumentListCtrl', {
        $scope: $scope,
        documentList: documentMock.documentList
      });
    }

    /**
     * Creates a fake promise then call
     *
     * @param  {array} data Data to pass to callback function
     */
    function fakePromise (data) {
      return function () {
        return {
          then: function (callback) {
            callback(data);
          }
        }
      };
    };
  });
});
