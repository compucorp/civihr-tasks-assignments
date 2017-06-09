/* eslint-env amd, jasmine */

define([
  'common/angular',
  'mocks/document',
  'tasks-assignments/app'
], function (angular, documentMock) {
  'use strict';

  describe('DocumentListCtrl', function () {
    var $controller, $rootScope, DocumentService, $scope, $q, deferred;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _DocumentService_, _$q_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      DocumentService = _DocumentService_;
      $q = _$q_;
      deferred = $q.defer();
    }));

    describe('init()', function () {
      beforeEach(function () {
        spyOn(DocumentService, 'cacheContactsAndAssignments').and.returnValue(deferred.promise);
        initController();
      });

      it('calls document service to cache contacts and assigments', function () {
        expect(DocumentService.cacheContactsAndAssignments).toHaveBeenCalled();
      });
    });

    function initController (scopeValues) {
      $controller('DocumentListCtrl', {
        $scope: $scope,
        documentList: documentMock.documentList
      });
    }
  });
});
