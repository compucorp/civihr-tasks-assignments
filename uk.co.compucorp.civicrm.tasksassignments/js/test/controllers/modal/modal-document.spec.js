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

  describe('ModalDocumentController', function () {
    var $controller, $rootScope, $filter, $scope, $q, $httpBackend, HRSettings, ContactService, config,
      AssignmentService, DocumentService, notification, fileService, data, role, files, sampleAssignee,
      modalMode, promise, mockDocument, controller;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_$window_, _$controller_, _$rootScope_, _$filter_, _$q_, _config_,
      _ContactService_, _DocumentService_, _AssignmentService_, _$httpBackend_, _fileService_) {
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
      config = _config_;
      ContactService = _ContactService_;
      DocumentService = _DocumentService_;
      AssignmentService = _AssignmentService_;
      fileService = _fileService_;

      $httpBackend.whenGET(/action=/).respond({});
    }));

    describe('init()', function () {
      beforeEach(function () {
        data = documentFabricator.single();
        initController();
      });

      it('sets the role as admin by default', function () {
        expect(controller.role).toBe('admin');
      });

      it('corectly formats date time in document', function () {
        expect(controller.document.activity_date_time).toEqual(new Date(documentFabricator.single().activity_date_time));
        expect(controller.document.expire_date).toEqual(new Date(documentFabricator.single().expire_date));
        expect(controller.document.valid_from).toEqual(new Date(documentFabricator.single().valid_from));
      });
    });

    describe('Document without Due Date (activity_date_time)', function () {
      beforeEach(function () {
        data = documentFabricator.single();
        delete data['activity_date_time'];
        initController();
      });

      it('due date default to null', function () {
        expect(controller.document.activity_date_time).toBe(null);
      });
    });

    describe('Lookup contacts lists', function () {
      describe('when in "New Document mode" for other contact page', function () {
        beforeEach(function () {
          $rootScope.cache.contact.arrSearch = cachedContacts();
          config.CONTACT_ID = '2';
          data = {};
          modalMode = 'new';

          initController();
        });

        it('has the list filled with just the contacts tant match the config.CONTACT_ID', function () {
          expect(controller.contacts.assignee).toEqual([]);
          expect(controller.contacts.target).toEqual([{ id: '2' }]);
        });
      });

      describe('when in "New Document" mode', function () {
        beforeEach(function () {
          initController();
        });

        it('has the lists empty', function () {
          expect(controller.contacts.assignee).toEqual([]);
          expect(controller.contacts.target).toEqual([]);
        });
      });

      describe('when in "edit Document" mode', function () {
        beforeEach(function () {
          data = { id: '2', assignee_contact_id: '3', target_contact_id: '1' };
          $rootScope.cache.contact.arrSearch = cachedContacts();

          initController();
        });

        it('has the list filled with just the contacts linked to the task', function () {
          expect(controller.contacts.assignee).toEqual([{ id: '3' }]);
          expect(controller.contacts.target).toEqual([{ id: '1' }]);
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
        expect(controller.parseDate('01/01/2005')).toBe('2005-01-01');
        // yyyy-mm-dd
        expect(controller.parseDate('2005-01-01')).toBe('2005-01-01');
        // date object
        expect(controller.parseDate(new Date(2005, 0, 1))).toBe('2005-01-01');
        // timestamp
        expect(controller.parseDate(new Date(2005, 0, 1).getTime())).toBe('2005-01-01');
      });

      it('should not parse invalid date', function () {
        expect(controller.parseDate(null)).toBe(null);
        expect(controller.parseDate(undefined)).toBe(null);
        expect(controller.parseDate(false)).toBe(null);
      });
    });

    describe('addAssignee()', function () {
      beforeEach(function () {
        initController();
        addAssignee(sampleAssignee);
      });

      it('adds contacts to list of assignees', function () {
        expect(controller.document.assignee_contact_id[0]).toBe(sampleAssignee.id);
      });

      it('adds assignee to contact search list', function () {
        expect($rootScope.cache.contact.arrSearch[0].id).toEqual(sampleAssignee.id);
        expect($rootScope.cache.contact.arrSearch[0].label).toEqual(sampleAssignee.label);
      });
    });

    describe('removeAssignee()', function () {
      beforeEach(function () {
        initController();
      });

      describe('added a assignee', function () {
        beforeEach(function () {
          addAssignee(sampleAssignee);
        });

        it('adds assignee in the list of assignees', function () {
          expect(controller.document.assignee_contact_id.length).toEqual(1);
        });
      });

      describe('assignee is removed', function () {
        beforeEach(function () {
          controller.removeAssignee(0);
        });

        it('removes assignee form the list of assignees', function () {
          expect(controller.document.assignee_contact_id.length).toEqual(0);
        });
      });
    });

    describe('remindMeInfo()', function () {
      beforeEach(function () {
        initController();
        spyOn(CRM, 'help');
        controller.remindMeInfo();
      });

      it('makes calls to CRM.help() to display help message', function () {
        expect(CRM.help).toHaveBeenCalledWith('Remind me?', controller.remindMeMessage, 'error');
      });
    });

    describe('isRole()', function () {
      beforeEach(function () {
        initController();

        controller.role = 'staff';
      });

      it('checks if the given role is the current one', function () {
        expect(controller.isRole('staff')).toBe(true);
        expect(controller.isRole('admin')).toBe(false);
      });
    });

    describe('getDocumentType()', function () {
      beforeEach(function () {
        initController();
        $rootScope.cache.documentType.arr = documentFabricator.documentTypes();
      });

      it('returns document type for document given id', function () {
        expect(controller.getDocumentType(documentFabricator.documentTypes()[1].key)).toEqual(documentFabricator.documentTypes()[1].value);
        expect(controller.getDocumentType(documentFabricator.documentTypes()[2].key)).toEqual(documentFabricator.documentTypes()[2].value);
        expect(controller.getDocumentType(documentFabricator.documentTypes()[3].key)).toEqual(documentFabricator.documentTypes()[3].value);
      });
    });

    describe('modalTitle()', function () {
      describe('when modalMode is not set', function () {
        beforeEach(function () {
          initController();
        });

        it('sets the modal title as "New Document" by default', function () {
          expect(controller.modalTitle).toBe('New Document');
        });
      });

      describe('when modalMode is edit', function () {
        beforeEach(function () {
          modalMode = 'edit';
          initController();
        });

        it('sets the document modal title to "Edit Document"', function () {
          expect(controller.modalTitle).toBe('Edit Document');
        });
      });
    });

    describe('onContactChanged', function () {
      beforeEach(function () {
        spyOn(ContactService, 'updateCache').and.returnValue({});

        initController();
        controller.onContactChanged(contactFabricator.single());
      });

      it('resets the document case id to empty', function () {
        expect(controller.document.case_id).toEqual('');
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
        promise = controller.searchContactAssignments('204');
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      it('calls assignment service to search assignments of target contact', function () {
        expect(AssignmentService.search).toHaveBeenCalledWith(null, null, '204');
      });

      it('search for assignments for a target contact and stores in $scope.assignments', function () {
        promise.then(function () {
          expect(controller.assignments).toEqual(assignmentFabricator.listResponse());
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
          angular.extend(controller.document, mockDocument);
          controller.confirm();
        });

        it('sets document with null due date to empty', function () {
          expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ activity_date_time: '' }));
        });
      });

      describe('document due date is empty', function () {
        beforeEach(function () {
          mockDocument.activity_date_time = '';
          angular.extend(controller.document, mockDocument);
          controller.confirm();
        });

        it('sets document with empty due date to empty', function () {
          expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ activity_date_time: '' }));
        });
      });

      describe('document has attachments', function () {
        beforeEach(function () {
          angular.extend(controller.document, mockDocument);
        });

        describe('document has attachments attached previously', function () {
          beforeEach(function () {
            controller.files.length = 2;
          });

          describe('user is admin', function () {
            beforeEach(function () {
              controller.role = 'admin';
              controller.confirm();
            });

            it('sets the document status to Approved', function () {
              expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '3' }));
            });
          });

          describe('user is staff', function () {
            beforeEach(function () {
              controller.role = 'staff';
              controller.confirm();
            });

            it('sets the documet status to Awaiting Approval', function () {
              expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '2' }));
            });
          });
        });

        describe('document has new attachments in upload queue', function () {
          beforeEach(function () {
            controller.uploader.queue.length = 3;
          });

          describe('user is admin', function () {
            beforeEach(function () {
              controller.role = 'admin';
              controller.confirm();
            });

            it('sets document status to Approved', function () {
              expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '3' }));
            });
          });

          describe('user is staff', function () {
            beforeEach(function () {
              controller.role = 'staff';
              controller.confirm();
            });

            it('sets document status to Awaiting Approval', function () {
              expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '2' }));
            });
          });
        });
      });

      describe("document doesn't contains files", function () {
        beforeEach(function () {
          angular.extend(controller.document, mockDocument);
        });

        describe('document does not have any attachments', function () {
          beforeEach(function () {
            controller.files.length = 0;
          });

          describe('user is admin', function () {
            beforeEach(function () {
              controller.role = 'admin';
              controller.confirm();
            });

            it('sets document status to Approved', function () {
              expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '3' }));
            });
          });

          describe('user is staff', function () {
            beforeEach(function () {
              controller.role = 'staff';
              controller.confirm();
            });

            it('sets document status to Awaiting Upload', function () {
              expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '1' }));
            });
          });
        });

        describe('document has attachments in upload queue', function () {
          beforeEach(function () {
            controller.uploader.queue.length = 0;
          });

          describe('user is admin', function () {
            beforeEach(function () {
              controller.role = 'admin';
              controller.confirm();
            });

            it('sets document status to Approved', function () {
              expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '3' }));
            });
          });

          describe('user is staff', function () {
            beforeEach(function () {
              controller.role = 'staff';
              controller.confirm();
            });

            it('sets document status to Awaiting Upload', function () {
              expect(DocumentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '1' }));
            });
          });
        });
      });
    });

    describe('viewFile()', function () {
      var file = {
        'name': 'sampleName',
        'url': 'test/file',
        'fileType': 'image/png'
      };

      beforeEach(function () {
        spyOn(fileService, 'openFile').and.returnValue($q.resolve('fileObject'));
      });

      beforeEach(function () {
        initController();
        controller.viewFile(file);
      });

      it('gets the blob file url for given file', function () {
        expect(fileService.openFile).toHaveBeenCalledWith(file);
      });
    });

    function addAssignee (assignee) {
      controller.addAssignee(assignee);
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
      controller = $controller('ModalDocumentController', {
        $scope: _.assign($scope, scopeValues),
        $filter: $filter,
        $uibModalInstance: fakeModalInstance(),
        data: data,
        files: files,
        role: role,
        config: config,
        modalMode: modalMode,
        HR_settings: HRSettings,
        notification: notification
      });
    }
  });
});
