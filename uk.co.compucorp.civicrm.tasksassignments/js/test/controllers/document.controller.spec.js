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

    describe('init', function () {
      beforeEach(initController);

      it('is defined', function () {
        expect(controller).toBeDefined();
      });
    });

    function initController () {
      $scope = $rootScope.$new();
      $scope.document = mockDocument;

      controller = $controller('DocumentController', {
        $scope: $scope,
        config: config
      });
    }
  });
});
