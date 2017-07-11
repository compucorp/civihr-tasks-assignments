/* globals inject */
/* eslint-env amd, jasmine */

define([
  'common/angular',
  'mocks/fabricators/document',
  'tasks-assignments/app'
], function (angular, documentFabricator) {
  'use strict';

  describe('DocumentListCtrl', function () {
    var $controller, $rootScope, DocumentService, $scope, $q, $httpBackend, config;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _DocumentService_, _$httpBackend_, _$q_, _config_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $q = _$q_;
      config = _config_;
      DocumentService = _DocumentService_;
      $httpBackend = _$httpBackend_;

      // Avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});
    }));

    beforeEach(function () {
      spyOn(DocumentService, 'get').and.returnValue($q.resolve([]));
      spyOn(DocumentService, 'cacheContactsAndAssignments').and.returnValue($q.resolve([]));
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
