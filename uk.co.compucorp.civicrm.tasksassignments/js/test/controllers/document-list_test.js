/* globals inject */
/* eslint-env amd, jasmine */

define([
  'common/angular',
  'mocks/fabricators/document',
  'tasks-assignments/app'
], function (angular, documentFabricator) {
  'use strict';

  describe('DocumentListCtrl', function () {
    var $controller, $rootScope, DocumentService, $scope, $q, $httpBackend, config, mockDocument;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _DocumentService_, _$httpBackend_, _$q_, _config_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $q = _$q_;
      config = _config_;
      DocumentService = _DocumentService_;
      $httpBackend = _$httpBackend_;
      mockDocument = documentFabricator.single();

      // Avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});
    }));

    beforeEach(function () {
      spyOn(DocumentService, 'get').and.returnValue($q.resolve([]));
      spyOn(DocumentService, 'cacheContactsAndAssignments').and.returnValue($q.resolve([]));
      spyOn(DocumentService, 'save').and.callFake(function () {
        mockDocument.status_id = '4';

        return $q.resolve(mockDocument);
      });
    });

    describe('init()', function () {
      beforeEach(function () {
        initController();
      });

      it('calls document service to cache contacts and assigments', function () {
        expect(DocumentService.cacheContactsAndAssignments).toHaveBeenCalled();
      });

      it('checks if default document status are defined for filter in T&A dashboard', function () {
        expect($scope.filterParamsHolder.documentStatus).toEqual(['1', '2']);
      });

      it('checks if default document status are not defined for filter in contact page', function () {
        expect($scope.filterParams.documentStatus).toEqual([]);
      });
    });

    describe('changeStatus()', function () {
      beforeEach(function () {
        initController();
        $scope.document = mockDocument;
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      describe('when the status is empty', function () {
        beforeEach(function () {
          $scope.changeStatus($scope.document, null);
        });

        it('does not update the document status', function () {
          expect(DocumentService.save).not.toHaveBeenCalled();
        });
      });

      describe('when the status is not empty', function () {
        beforeEach(function () {
          $scope.changeStatus($scope.document, '4');
        });

        it('updates the document status', function () {
          expect(DocumentService.save).toHaveBeenCalledWith({ id: $scope.document.id, status_id: '4' });
          expect($scope.document.status_id).toBe('4');
        });
      });
    });

    describe('$scope.loadDocumentsResolved', function () {
      var promise;

      beforeEach(function () {
        config.CONTACT_ID = 204;
        config.status.resolve.DOCUMENT = [1, 2];

        initController();
        promise = $scope.loadDocumentsResolved();
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      it('calls document service to document list', function () {
        expect(DocumentService.get).toHaveBeenCalledWith(jasmine.objectContaining({
          target_contact_id: config.CONTACT_ID,
          status_id: { IN: config.status.resolve.DOCUMENT }
        }));
      });

      it('calls document service to cache contacts and assignments', function () {
        promise.then(function () {
          expect(DocumentService.cacheContactsAndAssignments).toHaveBeenCalled();
        });
      });

      it('marks relolved section as loaded', function () {
        promise.then(function () {
          expect($scope.listResolvedLoaded).toBe(true);
        });
      });
    });

    function initController (scopeValues) {
      $controller('DocumentListCtrl', {
        $scope: $scope,
        config: config,
        documentList: documentFabricator.list()
      });
    }
  });
});
