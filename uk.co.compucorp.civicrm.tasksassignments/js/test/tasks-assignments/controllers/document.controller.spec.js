/* eslint-env amd, jasmine */

define([
  'mocks/fabricators/document.fabricator',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (documentFabricator) {
  'use strict';
  describe('DocumentController', function () {
    var $controller, $rootScope, $scope, config, controller, mockDocument;

    beforeEach(module('tasks-assignments.dashboard'));

    beforeEach(inject(function (_$controller_, $httpBackend, _$rootScope_, _config_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      config = _config_;
      mockDocument = documentFabricator.single();

      // Avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});
    }));

    beforeEach(function () {
      initController();
    });

    describe('init', function () {
      it('is defined', function () {
        expect(controller).toBeDefined();
      });
    });

    describe('File URL', function () {
      var expectedUrl;

      beforeEach(function () {
        expectedUrl = getDocumentFileUrl();
      });

      it('initializes the document\'s file URL', function () {
        expect($scope.fileUrl).toBe(expectedUrl);
      });

      describe('when the document id is updated', function () {
        beforeEach(function () {
          $scope.document.id = (+$scope.document.id + 1).toString(); // Increase the document ID by one
          expectedUrl = getDocumentFileUrl();

          $scope.$digest();
        });

        it('updates the the document\'s file URL', function () {
          expect($scope.fileUrl).toBe(expectedUrl);
        });
      });
    });

    function getDocumentFileUrl () {
      return config.url.FILE + '/zip?entityID=' + $scope.document.id + '&entityTable=civicrm_activity';
    }

    function initController () {
      $scope = $rootScope.$new();
      $scope.document = mockDocument;
      controller = $controller('DocumentController', {
        $scope: $scope,
        config: config
      });

      $scope.$digest();
    }
  });
});
