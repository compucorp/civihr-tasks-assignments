/* eslint-env amd, jasmine */

define([
  'common/angular',
  'common/moment',
  'common/lodash',
  'mocks/fabricators/document.fabricator',
  'mocks/fabricators/contact.fabricator',
  'mocks/fabricators/assignment.fabricator',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (angular, moment, _, documentFabricator, contactFabricator, assignmentFabricator) {
  'use strict';

  describe('DocumentListController', function () {
    var $controller, $rootScope, documentService, $scope, $q, $httpBackend, config, mockDocument, $filter, controller;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_$controller_, _$rootScope_, _documentService_, _$httpBackend_, _$q_, _config_, _$filter_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $filter = _$filter_;
      $scope = $rootScope.$new();
      $q = _$q_;
      config = _config_;
      documentService = _documentService_;
      $httpBackend = _$httpBackend_;
      mockDocument = documentFabricator.single();

      // Avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});
    }));

    beforeEach(function () {
      spyOn(documentService, 'get').and.returnValue($q.resolve([]));
      spyOn(documentService, 'cacheContactsAndAssignments').and.returnValue($q.resolve([]));
      spyOn(documentService, 'save').and.callFake(function () {
        mockDocument.status_id = '4';

        return $q.resolve(mockDocument);
      });
    });

    describe('init()', function () {
      beforeEach(function () {
        initController();
      });

      it('calls document service to cache contacts and assigments', function () {
        expect(documentService.cacheContactsAndAssignments).toHaveBeenCalled();
      });

      it('checks if default document status are defined for filter in T&A dashboard', function () {
        expect(controller.filterParamsHolder.documentStatus).toEqual(['1', '2']);
      });

      it('checks if default document status are not defined for filter in contact page', function () {
        expect(controller.filterParams.documentStatus).toEqual([]);
      });
    });

    describe('changeStatus()', function () {
      beforeEach(function () {
        initController();
        controller.document = mockDocument;
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      describe('when the status is empty', function () {
        beforeEach(function () {
          controller.changeStatus(controller.document, null);
        });

        it('does not update the document status', function () {
          expect(documentService.save).not.toHaveBeenCalled();
        });
      });

      describe('when the status is not empty', function () {
        beforeEach(function () {
          controller.changeStatus(controller.document, '4');
        });

        it('updates the document status', function () {
          expect(documentService.save).toHaveBeenCalledWith({ id: controller.document.id, status_id: '4' });
          expect(controller.document.status_id).toBe('4');
        });
      });
    });

    describe('labelDateRange()', function () {
      beforeEach(function () {
        initController();
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      it('formats and creates date range label', function () {
        expect(controller.label.dateRange).toBe('');
      });

      it('verifies the default date range are null', function () {
        expect(controller.filterParams.dateRange.from).toBe(null);
        expect(controller.filterParams.dateRange.until).toBe(null);
      });

      describe('when both form and until date are available', function () {
        beforeEach(function () {
          controller.filterParams.dateRange = {
            from: moment().startOf('day').toDate(),
            until: moment().add(2, 'month').startOf('day').toDate()
          };
          controller.labelDateRange();
        });

        it('formats and creates date range label', function () {
          expect(controller.label.dateRange).toBe($filter('date')(controller.filterParams.dateRange.from, 'dd/MM/yyyy') + ' - ' + $filter('date')(controller.filterParams.dateRange.until, 'dd/MM/yyyy'));
        });
      });

      describe('when only form date is available', function () {
        beforeEach(function () {
          controller.filterParams.dateRange = {
            from: moment().startOf('day').toDate(),
            until: ''
          };
          controller.labelDateRange();
        });

        it('formats and creates date range label containing form date only', function () {
          expect(controller.label.dateRange).toBe('From: ' + $filter('date')(controller.filterParams.dateRange.from, 'dd/MM/yyyy'));
        });
      });

      describe('when only until date is available', function () {
        beforeEach(function () {
          controller.filterParams.dateRange = {
            from: '',
            until: moment().add(2, 'month').startOf('day').toDate()
          };
          controller.labelDateRange();
        });

        it('formats and creates date range label containing until date only', function () {
          expect(controller.label.dateRange).toBe('Until: ' + $filter('date')(controller.filterParams.dateRange.until, 'dd/MM/yyyy'));
        });
      });
    });

    describe('filterByDateField()', function () {
      var filteredDocumentList;

      describe('filtering by due date', function () {
        beforeEach(function () {
          initController();
          controller.list = documentFabricator.list();
          controller.filterParams.dateRange = {
            from: '2017-05-01 00:00:00',
            until: '2017-05-10 00:00:00'
          };

          filteredDocumentList = controller.filterByDateField('dateRange');
        });

        it('returns filtered document by due date of the document', function () {
          expect(filteredDocumentList.length).toBe(1);
        });
      });

      describe('filtering by expiry date', function () {
        beforeEach(function () {
          initController();
          controller.list = documentFabricator.list();
          controller.filterParams.dateRange = {
            from: '2017-05-10 00:00:00',
            until: '2017-05-20 00:00:00'
          };

          filteredDocumentList = controller.filterByDateField('dateRange');
        });

        it('returns filtered document by expiry date of the document', function () {
          expect(filteredDocumentList.length).toBe(3);
        });
      });
    });

    describe('sortBy()', function () {
      var sortedDocumentList;

      beforeEach(function () {
        initController();
        fabricateDocumentStatuses();

        _.each(documentFabricator.documentTypes(), function (option) {
          $rootScope.cache.documentType.obj[option.key] = option.value;
        });

        _.each(contactFabricator.list(), function (option) {
          $rootScope.cache.contact.obj[option.contact_id] = option;
        });

        $rootScope.cache.assignmentType.obj = assignmentFabricator.assignmentTypes();
        $rootScope.cache.assignment.obj = assignmentFabricator.listAssignments();
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      describe('document are sorted by docuument type', function () {
        beforeEach(function () {
          sortedDocumentList = _.sortBy(controller.list, function (doc) {
            return $rootScope.cache.documentType.obj[doc.activity_type_id];
          });

          controller.sortBy('type');
        });

        it('lists documents by types', function () {
          expect(controller.list).toEqual(sortedDocumentList);
        });
      });

      describe('documents are sorted by document status', function () {
        beforeEach(function () {
          sortedDocumentList = _.sortBy(controller.list, function (doc) {
            return $rootScope.cache.documentStatus.obj[doc.status_id];
          });

          controller.sortBy('status_id');
        });

        it('lists documents by document status', function () {
          expect(controller.list).toEqual(sortedDocumentList);
        });
      });

      describe('document are sorted by document staff/target contact', function () {
        beforeEach(function () {
          sortedDocumentList = _.sortBy(controller.list, function (doc) {
            return $rootScope.cache.contact.obj[doc.target_contact_id[0]].sort_name;
          });

          controller.sortBy('target_contact');
        });

        it('lists documents by target contact/staff ', function () {
          expect(controller.list).toEqual(sortedDocumentList);
        });
      });

      describe('documents are sorted by assignees', function () {
        beforeEach(function () {
          sortedDocumentList = _.sortBy(controller.list, function (doc) {
            var assignee = doc.assignee_contact_id.length && _.find($rootScope.cache.contact.obj, {'id': doc.assignee_contact_id[0]});

            return assignee && assignee.sort_name;
          });
          controller.sortBy('assignee');
        });

        afterEach(function () {
          $rootScope.$apply();
        });

        it('lists documents by assignees', function () {
          expect(controller.list).toEqual(sortedDocumentList);
        });
      });

      describe('documents are sorted by assignment type', function () {
        beforeEach(function () {
          sortedDocumentList = _.sortBy(controller.list, function (doc) {
            var assignment = $rootScope.cache.assignment.obj[doc.case_id];
            var assignmentType = assignment && $rootScope.cache.assignmentType.obj[assignment.case_type_id];

            return assignmentType && assignmentType.title;
          });

          controller.sortBy('case_id');
        });

        it('lists documents by assignment type', function () {
          expect(controller.list).toEqual(sortedDocumentList);
        });
      });
    });

    describe('listAssignees()', function () {
      var assignees;
      var concatedAssignees = {};

      beforeEach(function () {
        initController();

        _.each(contactFabricator.list(), function (option) {
          $rootScope.cache.contact.obj[option.contact_id] = option;
        });

        concatedAssignees[contactFabricator.list()[0].contact_id] = contactFabricator.list()[0].sort_name.replace(',', '');
        concatedAssignees[contactFabricator.list()[1].contact_id] = contactFabricator.list()[1].sort_name.replace(',', '');
        concatedAssignees[contactFabricator.list()[2].contact_id] = contactFabricator.list()[2].sort_name.replace(',', '');
        assignees = controller.listAssignees(['202', '203', '204']);
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      it('concats the list of assignes by comma', function () {
        expect(assignees).toEqual(concatedAssignees);
      });
    });

    describe('applySidebarFilters()', function () {
      beforeEach(function () {
        initController();
      });

      describe('before applySidebarFilters() is called', function () {
        it('does not highlight the select dates filter section', function () {
          expect(controller.isDocumentSection).toBe(false);
        });
      });

      describe('after applySidebarFilters() is called', function () {
        beforeEach(function () {
          controller.filterParamsHolder.dateRange.from = moment().startOf('day').toDate();
          controller.filterParamsHolder.dateRange.until = moment().add(2, 'month').startOf('day').toDate();
          controller.applySidebarFilters();
        });

        it('highlights the select dates filter section', function () {
          expect(controller.isDocumentSection).toBe(true);
        });
      });
    });

    describe('date range filter', function () {
      var sampleDate1 = '14/04/1989';
      var sampleDate2 = '17/08/1989';

      beforeEach(function () {
        initController();
      });

      describe('when the "from" date is changed', function () {
        beforeEach(function () {
          controller.filterParamsHolder.dateRange.from = sampleDate1;

          $rootScope.$digest();
        });

        it('sets the minimum "to" date', function () {
          expect(controller.datepickerOptions.until.minDate).toBe(sampleDate1);
        });
      });

      describe('when the "to" date is changed', function () {
        beforeEach(function () {
          controller.filterParamsHolder.dateRange.until = sampleDate2;

          $rootScope.$digest();
        });

        it('sets the maximum "from" date', function () {
          expect(controller.datepickerOptions.from.maxDate).toBe(sampleDate2);
        });
      });
    });

    describe('filter tabs', function () {
      var allDocumentStatuses = _.pluck(documentFabricator.documentStatus(), 'key');
      var onlyPendingDocumentStatuses = getDocumentStatusesIds(
        ['awaiting upload', 'awaiting approval']);
      var sampleDocumentStatuses = getDocumentStatusesIds(
        ['awaiting upload', 'approved', 'rejected']);
      var tabsShowingOnlyPendingDocuments = [
        { title: 'Overdue', value: 'overdue' },
        { title: 'Next fortnight', value: 'dueInNextFortnight' },
        { title: '90 days', value: 'dueInNinetyDays' }
      ];

      beforeEach(function () {
        initController();
        fabricateDocumentStatuses();

        controller.filterParamsHolder.documentStatus = sampleDocumentStatuses;
      });

      tabsShowingOnlyPendingDocuments.forEach(function (tab) {
        describe('user selects "' + tab.title + '" filter tab', function () {
          beforeEach(function () {
            controller.filterParams.due = tab.value;

            $rootScope.$digest();
          });

          it('sets the document statuses to filter by to only pending ones', function () {
            expect(controller.filterParams.documentStatus)
              .toEqual(onlyPendingDocumentStatuses);
          });

          it('allows to select only pending statuses for further filtering', function () {
            expect(_.pluck(controller.filterParams.allowedStatuses, 'key'))
              .toEqual(onlyPendingDocumentStatuses);
          });

          it('removes "Approved" and "Rejected" statuses from the filter selection', function () {
            expect(controller.filterParamsHolder.documentStatus)
              .toEqual(getDocumentStatusesIds(['awaiting upload']));
          });
        });
      });

      describe('user selects "All" filter tab', function () {
        beforeEach(function () {
          // @NOTE in this case the `due` propetry is an empty string, not "all"
          controller.filterParams.due = '';

          $rootScope.$digest();
        });

        it('flushes the document statuses so no filtering by status happens', function () {
          expect(controller.filterParams.documentStatus).toEqual([]);
        });

        it('allows to select any statuses for further filtering', function () {
          expect(_.pluck(controller.filterParams.allowedStatuses, 'key'))
            .toEqual(allDocumentStatuses);
        });

        it('leaves selected statuses in the filter unamended', function () {
          expect(controller.filterParamsHolder.documentStatus)
            .toEqual(sampleDocumentStatuses);
        });
      });
    });

    describe('document is saved', function () {
      var document, changedDoc;

      beforeEach(function () {
        initController();
      });

      describe('when adding new document', function () {
        beforeEach(function () {
          $rootScope.$broadcast('documentFormSuccess', documentFabricator.single(), {});
          $scope.$apply();

          document = controller.list[controller.list.length - 1];
        });

        it('adds new document in the document list', function () {
          expect(document).toEqual(documentFabricator.single());
        });
      });

      describe('when editing existing document', function () {
        beforeEach(function () {
          changedDoc = angular.extend(
            {},
            documentFabricator.list()[0],
            { status_id: '4', activity_type_id: '70' });
          $rootScope.$broadcast('documentFormSuccess', changedDoc, documentFabricator.list()[0]);
          $scope.$apply();

          document = _.find(controller.list, { 'id': documentFabricator.list()[0].id });
        });

        it('adds new document in the document list', function () {
          expect(document.status_id).toEqual(changedDoc.status_id);
        });
      });
    });

    /**
     * Fabricates document statuses and sets them to the root scope cache
     */
    function fabricateDocumentStatuses () {
      _.each(documentFabricator.documentStatus(), function (option) {
        $rootScope.cache.documentStatus.obj[option.key] = option.value;
        $rootScope.cache.documentStatus.arr.push(option);
      });
    }

    /**
     * Gets document statuses IDs by their names
     *
     * @param  {Array} statusesNames
     * @return {Array} statuses IDs
     */
    function getDocumentStatusesIds (statusesNames) {
      var statuses = documentFabricator.documentStatus();

      return statusesNames
        .map(function (statusName) {
          return _.find(statuses, { value: statusName }).key;
        });
    }

    /**
     * Initiates the controller
     */
    function initController () {
      controller = $controller('DocumentListController', {
        $scope: $scope,
        config: config,
        documentList: documentFabricator.list()
      });
    }
  });
});
