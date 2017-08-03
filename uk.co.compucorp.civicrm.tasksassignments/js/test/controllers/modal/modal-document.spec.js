/* eslint-env amd, jasmine */

define([
  'common/angular',
  'common/moment',
  'common/lodash',
  'common/angularMocks',
  'mocks/fabricators/assignment',
  'mocks/fabricators/contact',
  'mocks/fabricators/document',
  'tasks-assignments/app'
], function (angular, moment, _, ngMocks, assignmentFabricator, contactFabricator, documentFabricator) {
  'use strict';

  describe('ModalDocumentCtrl', function () {
    var $controller, $rootScope, $filter, $scope, $q, $httpBackend, HRSettings, ContactService,
      AssignmentService, DocumentService, notification, data, role, files, sampleAssignee,
      modalMode, promise, mockDocument, ctrl;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$window_, _$controller_, _$rootScope_, _$filter_, _$q_,
      _ContactService_, _DocumentService_, _AssignmentService_, _$httpBackend_) {
      data = {};
      files = {};
      modalMode = '';
      notification = '';
      role = '';
      HRSettings = { DATE_FORMAT: 'DD/MM/YYYY' };
      sampleAssignee = {
        id: 5,
        label: 'sample label',
        icon_class: 'fa fa-plus',
        description: 'this is sample desc'
      };
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $filter = _$filter_;
      $httpBackend = _$httpBackend_;
      $q = _$q_;
      ContactService = _ContactService_;
      DocumentService = _DocumentService_;
      AssignmentService = _AssignmentService_;

      // A workaround to avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});
    }));

    describe('init()', function () {
      beforeEach(function () {
        data = documentFabricator.single();
        initController();
      });

      it('sets the role as admin by default', function () {
        expect(ctrl.role).toBe('admin');
      });

      it('corectly formats date time in document', function () {
        expect(ctrl.document.activity_date_time).toEqual(new Date(documentFabricator.single().activity_date_time));
        expect(ctrl.document.expire_date).toEqual(new Date(documentFabricator.single().expire_date));
        expect(ctrl.document.valid_from).toEqual(new Date(documentFabricator.single().valid_from));
      });
    });

    describe('Document without Due Date (activity_date_time)', function () {
      beforeEach(function () {
        data = documentFabricator.single();
        delete data['activity_date_time'];
        initController();
      });

      it('due date default to null', function () {
        expect(ctrl.document.activity_date_time).toBe(null);
      });
    });

    describe('Lookup contacts lists', function () {
      describe('when in "new task" mode', function () {
        beforeEach(function () {
          initController();
        });

        it('has the lists empty', function () {
          expect(ctrl.contacts.assignee).toEqual([]);
          expect(ctrl.contacts.target).toEqual([]);
        });
      });

      describe('when in "edit task" mode', function () {
        beforeEach(function () {
          data = { id: '2', assignee_contact_id: '3', target_contact_id: '1' };
          $rootScope.cache.contact.arrSearch = cachedContacts();

          initController();
        });

        it('has the list filled with just the contacts linked to the task', function () {
          expect(ctrl.contacts.assignee).toEqual([{ id: '3' }]);
          expect(ctrl.contacts.target).toEqual([{ id: '1' }]);
        });
      });

      /**
       * A mocked list of cached contacts
       * @return {Array}
       */
      function cachedContacts () {
        return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
      }
    });

    describe('parseDate()', function () {
      beforeEach(function () {
        initController();
      });

      it('should correctly parse valid date', function () {
        // dd/mm/yyyy
        expect(ctrl.parseDate('01/01/2005')).toBe('2005-01-01');
        // yyyy-mm-dd
        expect(ctrl.parseDate('2005-01-01')).toBe('2005-01-01');
        // date object
        expect(ctrl.parseDate(new Date(2005, 0, 1))).toBe('2005-01-01');
        // timestamp
        expect(ctrl.parseDate(new Date(2005, 0, 1).getTime())).toBe('2005-01-01');
      });

      it('should not parse invalid date', function () {
        expect(ctrl.parseDate(null)).toBe(null);
        expect(ctrl.parseDate(undefined)).toBe(null);
        expect(ctrl.parseDate(false)).toBe(null);
      });
    });

    describe('addAssignee()', function () {
      beforeEach(function () {
        initController();
        addAssignee(sampleAssignee);
      });

      it('adds contacts to list of assignees', function () {
        expect(ctrl.document.assignee_contact_id[0]).toBe(sampleAssignee.id);
      });

      it('adds assignee to contact search list', function () {
        expect($rootScope.cache.contact.arrSearch[0].id).toEqual(sampleAssignee.id);
        expect($rootScope.cache.contact.arrSearch[0].label).toEqual(sampleAssignee.label);
      });
    });

    describe('removeAssignee()', function () {
      beforeEach(function () {
        initController();
        addAssignee(sampleAssignee);
      });

      it('removes assignee form the list of assignees', function () {
        expect(ctrl.document.assignee_contact_id.length).toEqual(1);
        ctrl.removeAssignee(0);
        expect(ctrl.document.assignee_contact_id.length).toEqual(0);
      });
    });

    describe('remindMeInfo()', function () {
      beforeEach(function () {
        initController();
        spyOn(CRM, 'help');
        ctrl.remindMeInfo();
      });

      it('makes calls to CRM.help() to display help message', function () {
        expect(CRM.help).toHaveBeenCalledWith('Remind me?', ctrl.remindMeMessage, 'error');
      });
    });

    describe('isRole()', function () {
      beforeEach(function () {
        initController();

        ctrl.role = 'staff';
      });

      it('checks if the given role is the current one', function () {
        expect(ctrl.isRole('staff')).toBe(true);
        expect(ctrl.isRole('admin')).toBe(false);
      });
    });

    describe('getDocumentType()', function () {
      beforeEach(function () {
        initController();
        $rootScope.cache.documentType.arr = documentFabricator.documentTypes();
      });

      it('returns document type for document given id', function () {
        expect(ctrl.getDocumentType(documentFabricator.documentTypes()[1].key)).toEqual(documentFabricator.documentTypes()[1].value);
        expect(ctrl.getDocumentType(documentFabricator.documentTypes()[2].key)).toEqual(documentFabricator.documentTypes()[2].value);
        expect(ctrl.getDocumentType(documentFabricator.documentTypes()[3].key)).toEqual(documentFabricator.documentTypes()[3].value);
      });
    });

    describe('modalTitle()', function () {
      describe('when modalMode is not set', function () {
        beforeEach(function () {
          initController();
        });

        it('sets the modal title as "New Document" by default', function () {
          expect(ctrl.modalTitle).toBe('New Document');
        });
      });

      describe('when modalMode is edit', function () {
        beforeEach(function () {
          modalMode = 'edit';
          initController();
        });

        it('sets the document modal title to "Edit Document"', function () {
          expect(ctrl.modalTitle).toBe('Edit Document');
        });
      });
    });

    describe('onContactChanged', function () {
      beforeEach(function () {
        spyOn(ContactService, 'updateCache').and.returnValue({});

        initController();
        ctrl.onContactChanged(contactFabricator.single());
      });

      it('resets the document case id to empty', function () {
        expect(ctrl.document.case_id).toEqual('');
      });

      it('calls contact service to cache selected Contact', function () {
        expect(ContactService.updateCache).toHaveBeenCalled();
      });
    });

    describe('searchContactAssignments', function () {
      beforeEach(function () {
        spyOn($rootScope, '$broadcast').and.callThrough();
        spyOn(AssignmentService, 'search').and.returnValue($q.resolve(assignmentFabricator.listResponse()));
      });

      beforeEach(function () {
        initController();
        promise = ctrl.searchContactAssignments('204');
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      it('calls assignment service to search assignments of target contact', function () {
        expect(AssignmentService.search).toHaveBeenCalledWith(null, null, '204');
      });

      it('search for assignments for a target contact and stores in $scope.assignments', function () {
        promise.then(function () {
          expect(ctrl.assignments).toEqual(assignmentFabricator.listResponse());
        });
      });

      it('hides spinner once the search is done', function () {
        promise.then(function () {
          expect($rootScope.$broadcast).toHaveBeenCalledWith('ct-spinner-hide');
        });
      });
    });

    describe('confirm', function () {
      beforeEach(function () {
        mockDocument = {
          target_contact_id: ['202'],
          activity_type_id: '1'
        };
        spyOn(DocumentService, 'save').and.returnValue($q.resolve([]));
        initController();
      });

      describe('document due date is null', function () {
        beforeEach(function () {
          mockDocument.activity_date_time = null;
          angular.extend(ctrl.document, mockDocument);
          ctrl.confirm();
        });

        it('sets document with null due date to empty', function () {
          expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ activity_date_time: '' }));
        });
      });

      describe('document due date is empty', function () {
        beforeEach(function () {
          mockDocument.activity_date_time = '';
          angular.extend(ctrl.document, mockDocument);
          ctrl.confirm();
        });

        it('sets document with empty due date to empty', function () {
          expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ activity_date_time: '' }));
        });
      });
    });

    function addAssignee (assignee) {
      ctrl.addAssignee(assignee);
    }

    function fakeModalInstance () {
      return {
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then')
        }
      };
    }

    function initController (scopeValues) {
      ctrl = $controller('ModalDocumentCtrl', {
        $scope: _.assign($scope, scopeValues),
        $filter: $filter,
        $uibModalInstance: fakeModalInstance(),
        data: data,
        files: files,
        role: role,
        modalMode: modalMode,
        HR_settings: HRSettings,
        notification: notification
      });
    }
  });
});
