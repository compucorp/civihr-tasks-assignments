/* eslint-env amd, jasmine */

define([
  'common/angular',
  'common/moment',
  'common/lodash',
  'common/angularMocks',
  'mocks/fabricators/assignment.fabricator',
  'mocks/fabricators/contact.fabricator',
  'mocks/fabricators/document.fabricator',
  'mocks/fabricators/file.fabricator',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (angular, moment, _, ngMocks, assignmentFabricator, contactFabricator, documentFabricator, fileFabricator) {
  'use strict';

  describe('ModalDocumentController', function () {
    var $controller, $rootScope, $filter, $scope, $q, $httpBackend, HRSettings, contactService, config,
      assignmentService, appSettingsService, documentService, notification, fileService, data, role, files, sampleAssignee,
      modalMode, promise, mockDocument, controller;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_$window_, _$controller_, _$rootScope_, _$filter_, _$q_, _config_,
      _contactService_, _documentService_, _assignmentService_, _$httpBackend_, _fileService_, _appSettingsService_) {
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
      contactService = _contactService_;
      documentService = _documentService_;
      assignmentService = _assignmentService_;
      appSettingsService = _appSettingsService_;
      fileService = _fileService_;
      window.alert = function () {}; // prevent alert from being logged in console

      $rootScope.cache.documentStatus.obj = {
        1: 'awaiting upload',
        2: 'awaiting approval',
        3: 'approved',
        4: 'rejected'
      };

      $httpBackend.whenGET(/action=/).respond({});
    }));

    describe('init()', function () {
      beforeEach(function () {
        data = documentFabricator.single();
        spyOn(appSettingsService, 'get').and.returnValue($q.resolve([]));

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

      it('calls appSettingsService to get maxFileSize value', function () {
        expect(appSettingsService.get).toHaveBeenCalledWith([ 'maxFileSize' ]);
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

    describe('onContactChanged()', function () {
      beforeEach(function () {
        spyOn(contactService, 'updateCache').and.returnValue({});

        initController();
        controller.onContactChanged(contactFabricator.single());
      });

      it('resets the document case id to empty', function () {
        expect(controller.document.case_id).toEqual('');
      });

      it('calls contact service to cache selected Contact', function () {
        expect(contactService.updateCache).toHaveBeenCalled();
      });
    });

    describe('searchContactAssignments()', function () {
      beforeEach(function () {
        spyOn($rootScope, '$broadcast').and.callThrough();
        spyOn(assignmentService, 'search').and.returnValue($q.resolve(assignmentFabricator.listResponse()));
      });

      beforeEach(function () {
        initController();
        promise = controller.searchContactAssignments('204');
      });

      afterEach(function () {
        $rootScope.$apply();
      });

      it('calls assignment service to search assignments of target contact', function () {
        expect(assignmentService.search).toHaveBeenCalledWith(null, null, '204');
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

    describe('confirm()', function () {
      beforeEach(function () {
        mockDocument = {
          target_contact_id: ['202'],
          activity_type_id: '1'
        };
        spyOn(documentService, 'save').and.returnValue($q.resolve([]));
        initController();
      });

      describe('document due date is null', function () {
        beforeEach(function () {
          mockDocument.activity_date_time = null;
          angular.extend(controller.document, mockDocument);
          controller.confirm();
        });

        it('sets document with null due date to empty', function () {
          expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ activity_date_time: '' }));
        });
      });

      describe('document due date is empty', function () {
        beforeEach(function () {
          mockDocument.activity_date_time = '';
          angular.extend(controller.document, mockDocument);
          controller.confirm();
        });

        it('sets document with empty due date to empty', function () {
          expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ activity_date_time: '' }));
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
              expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '3' }));
            });
          });

          describe('user is staff', function () {
            beforeEach(function () {
              controller.role = 'staff';
              controller.confirm();
            });

            it('sets the documet status to Awaiting Approval', function () {
              expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '2' }));
            });
          });
        });

        describe('document has new attachments in upload queue', function () {
          beforeEach(function () {
            getFileLimitSize(controller);
            controller.uploader.queue = fileFabricator.list();
          });

          describe('user is admin', function () {
            beforeEach(function () {
              controller.role = 'admin';
            });

            describe('when uploaded files sizes are smaller than max file limit', function () {
              beforeEach(function () {
                controller.confirm();
              });

              it('saves the document with status to Approved', function () {
                expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '3' }));
              });
            });

            describe('when uploaded files sizes are larger than max file limit', function () {
              beforeEach(function () {
                controller.uploader.queue[0]._file.size = '78000000';
                controller.uploader.queue[1]._file.size = '108000000';
                controller.confirm();
              });

              it('does not save the document', function () {
                expect(documentService.save).not.toHaveBeenCalled();
              });
            });
          });

          describe('user is staff', function () {
            beforeEach(function () {
              controller.role = 'staff';
              controller.confirm();
            });

            it('sets document status to Awaiting Approval', function () {
              expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '2' }));
            });
          });
        });
      });

      describe("document doesn't contains attachments", function () {
        beforeEach(function () {
          angular.extend(controller.document, mockDocument);
        });

        describe("document doesn't contain attachments at all", function () {
          beforeEach(function () {
            controller.uploader.queue.length = 0;
            controller.files.length = 0;
            angular.extend(controller.document, mockDocument);
          });

          describe('when user is staff', function () {
            beforeEach(function () {
              controller.role = 'staff';
              controller.confirm();
            });

            it("flags document doesn't contain files", function () {
              expect(controller.containsFiles).toEqual(false);
            });

            it("doesn't call documentService to update status", function () {
              expect(documentService.save).not.toHaveBeenCalled();
            });
          });

          describe('when user is admin', function () {
            beforeEach(function () {
              controller.role = 'admin';
              controller.confirm();
            });

            it('skips size validation and returns true and saves the document', function () {
              expect(documentService.save).toHaveBeenCalled();
            });

            it("flags document doesn't contain files", function () {
              expect(controller.containsFiles).toEqual(true);
            });

            it('sets document status to Awaiting Upload', function () {
              expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '1' }));
            });
          });
        });

        describe("document doesn't have existing attachments", function () {
          beforeEach(function () {
            getFileLimitSize(controller);
            controller.files.length = 0;
            controller.uploader.queue = fileFabricator.list();
          });

          describe('user is admin', function () {
            beforeEach(function () {
              controller.role = 'admin';
              controller.confirm();
            });

            it('sets document status to Approved', function () {
              expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '3' }));
            });
          });

          describe('user is staff', function () {
            beforeEach(function () {
              controller.role = 'staff';

              controller.confirm();
            });

            it('calls documentService to update status to awaiting approval', function () {
              expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '2' }));
            });
          });
        });

        describe("document doesn't have attachments in upload queue", function () {
          beforeEach(function () {
            getFileLimitSize(controller);
            controller.files.length = 3;
            controller.uploader.queue.length = 0;
          });

          describe('user is admin', function () {
            beforeEach(function () {
              controller.role = 'admin';
              controller.confirm();
            });

            it('sets document status to Approved', function () {
              expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '3' }));
            });
          });

          describe('user is staff', function () {
            beforeEach(function () {
              controller.role = 'staff';
              controller.confirm();
            });

            it('calls documentService to update status to awaiting approval', function () {
              expect(documentService.save).toHaveBeenCalledWith(jasmine.objectContaining({ status_id: '2' }));
            });
          });
        });
      });
    });

    describe('getStatusIdByName()', function () {
      beforeEach(function () {
        initController();
      });

      it('gets id for Awaiting Upload to be 1', function () {
        expect(controller.getStatusIdByName('awaiting upload')).toEqual('1');
      });

      it('gets id for Awaiting Approval to be 2', function () {
        expect(controller.getStatusIdByName('awaiting approval')).toEqual('2');
      });

      it('gets id for Approved to be 3', function () {
        expect(controller.getStatusIdByName('approved')).toEqual('3');
      });

      it('gets id for Rejected to be 4', function () {
        expect(controller.getStatusIdByName('rejected')).toEqual('4');
      });
    });

    describe('getDocumentStatus()', function () {
      beforeEach(function () {
        initController();
        controller.files.length = 2;
      });

      describe('user is admin', function () {
        beforeEach(function () {
          controller.role = 'admin';
        });

        it('gets the document status id as 3 (approved)', function () {
          expect(controller.getDocumentStatus()).toEqual('3');
        });
      });

      describe('user is staff', function () {
        beforeEach(function () {
          controller.role = 'staff';
        });

        it('gets the document status id as 2 (awaiting approval)', function () {
          expect(controller.getDocumentStatus()).toEqual('2');
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

    function getFileLimitSize (controller) {
      controller.fileSizeLimit = 32000000;
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
