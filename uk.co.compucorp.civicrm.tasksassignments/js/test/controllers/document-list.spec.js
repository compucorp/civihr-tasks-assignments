/* globals inject */
/* eslint-env amd, jasmine */

define([
  'common/moment',
  'common/angular',
  'mocks/fabricators/document',
  'tasks-assignments/app'
], function (moment, angular, documentFabricator) {
  'use strict';

  describe('DocumentListCtrl', function () {
    var $controller, $rootScope, DocumentService, $scope, $q, $httpBackend, config, mockDocument, $filter;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _DocumentService_, _$httpBackend_, _$q_, _config_, _$filter_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $filter = _$filter_;
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

    describe('labelDateRange()', function () {
      var fromDate = moment().startOf('day').toDate();
      var untilDate = moment().add(1, 'month').startOf('day').toDate();

      beforeEach(function () {
        initController();
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      it('formats and creates date range label', function () {
        expect($scope.label.dateRange).toBe($filter('date')(fromDate, 'dd/MM/yyyy') + ' - ' + $filter('date')(untilDate, 'dd/MM/yyyy'));
      });

      describe('when both form and until date are available', function () {
        beforeEach(function () {
          $scope.filterParams.dateRange = {
            from: moment().startOf('day').toDate(),
            until: moment().add(2, 'month').startOf('day').toDate()
          };
          $scope.labelDateRange();
        });

        it('formats and creates date range label', function () {
          expect($scope.label.dateRange).toBe($filter('date')($scope.filterParams.dateRange.from, 'dd/MM/yyyy') + ' - ' + $filter('date')($scope.filterParams.dateRange.until, 'dd/MM/yyyy'));
        });
      });

      describe('when only form date is available', function () {
        beforeEach(function () {
          $scope.filterParams.dateRange = {
            from: moment().startOf('day').toDate(),
            until: ''
          };
          $scope.labelDateRange();
        });

        it('formats and creates date range label containing form date only', function () {
          expect($scope.label.dateRange).toBe('From: ' + $filter('date')($scope.filterParams.dateRange.from, 'dd/MM/yyyy'));
        });
      });

      describe('when only until date is available', function () {
        beforeEach(function () {
          $scope.filterParams.dateRange = {
            from: '',
            until: moment().add(2, 'month').startOf('day').toDate()
          };
          $scope.labelDateRange();
        });

        it('formats and creates date range label containing until date only', function () {
          expect($scope.label.dateRange).toBe('Until: ' + $filter('date')($scope.filterParams.dateRange.until, 'dd/MM/yyyy'));
        });
      });
    });

    describe('filterByDateField()', function () {
      var filteredDocumentList;

      describe('filtering by due date', function () {
        beforeEach(function () {
          initController();
          $scope.list = documentFabricator.list();
          $scope.filterParams.dateRange = {
            from: '2017-05-01 00:00:00',
            until: '2017-05-10 00:00:00'
          };

          filteredDocumentList = $scope.filterByDateField('dateRange');
        });

        it('returns filtered document by due date of the document', function () {
          expect(filteredDocumentList.length).toBe(1);
        });
      });

      describe('filtering by expiry date', function () {
        beforeEach(function () {
          initController();
          $scope.list = documentFabricator.list();
          $scope.filterParams.dateRange = {
            from: '2017-05-10 00:00:00',
            until: '2017-05-20 00:00:00'
          };

          filteredDocumentList = $scope.filterByDateField('dateRange');
        });

        it('returns filtered document by expiry date of the document', function () {
          expect(filteredDocumentList.length).toBe(3);
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
