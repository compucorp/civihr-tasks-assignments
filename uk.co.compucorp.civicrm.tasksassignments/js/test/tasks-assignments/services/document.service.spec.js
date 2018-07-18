/* eslint-env amd, jasmine */

define([
  'mocks/fabricators/document.fabricator',
  'mocks/fabricators/contact.fabricator',
  'mocks/data/assignment.data',
  'mocks/data/document.data',
  'common/angularMocks',
  'tasks-assignments/modules/tasks-assignments.dashboard.module'
], function (documentMock, contactMock, assignmentMock, documentFabricator) {
  'use strict';

  describe('Document', function () {
    var Document, requestBody, $httpBackend, $httpParamSerializer;
    var request = {};

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_Document_, _$httpBackend_, _$httpParamSerializer_) {
      $httpParamSerializer = _$httpParamSerializer_;
      Document = _Document_;
      $httpBackend = _$httpBackend_;
    }));

    beforeEach(function () {
      $httpBackend.whenGET(/views.*/).respond({});
      $httpBackend.whenGET(/action=/).respond({});
      $httpBackend.whenPOST(/action=create&debug=true&entity=Document/).respond(function (method, url, data, headers) {
        request.method = method;
        request.headers = headers;
        request.data = data;

        return [200];
      });
    });

    beforeEach(function () {
      spyOn(Document, 'save').and.callThrough();
    });

    describe('save()', function () {
      beforeEach(function () {
        Document.save({
          action: 'create'
        }, {json: documentMock.single() || {}});

        requestBody = Document.save.calls.argsFor(0)[1];
        $httpBackend.flush();
      });

      it('makes request with Content-Type as application/x-www-form-urlencoded; charset=UTF-8', function () {
        expect(request.headers['Content-Type']).toEqual('application/x-www-form-urlencoded; charset=UTF-8');
      });

      it('adds url encoding to Document Data', function () {
        expect(request.data).toEqual($httpParamSerializer({ json: documentMock.single() }));
      });

      it('calls save() as POST request with Document data', function () {
        expect(request.method).toEqual('POST');
        expect(requestBody.json).toEqual(documentMock.single());
      });
    });
  });

  describe('documentService', function () {
    var assignmentService, contactService, documentService, $q,
      deferred, config, promise, $httpBackend;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_assignmentService_, _contactService_,
      _documentService_, _config_, _$q_, _$httpBackend_) {
      assignmentService = _assignmentService_;
      contactService = _contactService_;
      documentService = _documentService_;
      config = _config_;
      $q = _$q_;
      $httpBackend = _$httpBackend_;
      deferred = $q.defer();
    }));

    beforeEach(function () {
      spyOn(contactService, 'get').and.callFake(fakePromise(contactMock.list()));
      spyOn(assignmentService, 'get').and.callFake(fakePromise(assignmentMock.assignmentList));
      spyOn(contactService, 'updateCache').and.returnValue(deferred.promise);
      spyOn(assignmentService, 'updateCache').and.returnValue(deferred.promise);

      $httpBackend.whenGET(/action=get&debug=true&entity=contact/).respond({});
      $httpBackend.whenGET(/action=get&entity=CaseType/).respond({});
      $httpBackend.whenGET(/action=get&debug=true&entity=Task/).respond({});
      $httpBackend.whenGET(/action=getoptions&debug=true&entity=Task/).respond({});
      $httpBackend.whenGET(/views.*/).respond({});
    });

    afterEach(function () {
      $httpBackend.flush();
    });

    describe('cacheContactsAndAssignments()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=/).respond({});
        $httpBackend.whenGET(/views.*/).respond({});
      });

      describe('needs to cache the contacts and assignments of the given documents', function () {
        beforeEach(function () {
          config.CONTACT_ID = '210';
          promise = documentService.cacheContactsAndAssignments(documentMock.list());
        });

        it('calls contact service to get details using contactIds', function () {
          expect(contactService.get).toHaveBeenCalledWith(jasmine.objectContaining({
            'IN': ['204', '202', '204', '205', '205', '204', '204', '205', '202', '202', '205', '203', '203', '205', '204', '203', '210']
          }));
        });

        it('calls contact service to get details using assignmentIds', function () {
          expect(assignmentService.get).toHaveBeenCalledWith(jasmine.objectContaining({
            'IN': ['5', '9', '10', '5']
          }));
        });

        it('calls contact service to cache contacts', function () {
          expect(contactService.updateCache).toHaveBeenCalled();
        });

        it('calls contact service to cache assignments', function () {
          expect(assignmentService.updateCache).toHaveBeenCalled();
        });

        it('returns a promise', function () {
          expect(typeof (promise.then)).toEqual('function');
        });
      });

      describe('needs to cache either contacts or assignments exclusively', function () {
        describe('needs to cache only contacts', function () {
          beforeEach(function () {
            documentService.cacheContactsAndAssignments(documentMock.list(), 'contacts');
          });

          it('calls contact service to cache contacts', function () {
            expect(contactService.updateCache).toHaveBeenCalled();
          });

          it('does not call assignment service to cache contacts', function () {
            expect(assignmentService.updateCache).not.toHaveBeenCalled();
          });
        });

        describe('needs to cache only assignments', function () {
          beforeEach(function () {
            documentService.cacheContactsAndAssignments(documentMock.list(), 'assignments');
          });

          it('calls assignment service to cache assignments', function () {
            expect(assignmentService.updateCache).toHaveBeenCalled();
          });

          it('does not calls contact service to cache assignments', function () {
            expect(contactService.updateCache).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('save()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Document/).respond({});
        $httpBackend.whenPOST(/action=create&debug=true&entity=Document/).respond(documentFabricator.onSave);
      });

      it('returns saved Document on saving Document', function () {
        documentService.save(documentMock.single()).then(function (data) {
          expect(data).toEqual(documentMock.single());
        });
      });
    });

    describe('assign()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions/).respond({});
        $httpBackend.whenPOST(/action=copy_to_assignment&debug=true&entity=Document/).respond(documentFabricator.onAssign);
      });

      it('returns list of assigned documents on assigning documents', function () {
        documentService.assign(documentMock.list(), 1).then(function (data) {
          expect(data).toEqual(documentMock.list());
        });
      });
    });

    describe('saveMultiple()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions/).respond({});
        $httpBackend.whenPOST(/action=create_multiple&debug=true&entity=Document/).respond(documentFabricator.onSaveMultiple);
      });

      it('returns saved task list on saving multiple documents', function () {
        documentService.saveMultiple(documentMock.list()).then(function (data) {
          expect(data).toEqual(documentMock.list());
        });
      });
    });
    //
    describe('sendReminder()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions/).respond({});
        $httpBackend.whenPOST(/action=sendreminder&debug=true&entity=Document/).respond(documentFabricator.onSendReminder);
      });

      it('returns reminder sent status on sending reminder for a Document', function () {
        documentService.sendReminder(1, documentMock.reminderNote).then(function (data) {
          expect(data.values).toEqual(true);
        });
      });
    });
    //
    describe('getDocumentTypes()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Document/).respond(documentFabricator.onGetOptions.documentTypes);
        promise = $q.all({
          documentType: documentService.getDocumentTypes()
        });
      });

      it('returns promise with array of list of document types', function () {
        promise.then(function (options) {
          expect(options.documentType.obj).toBeDefined();
          expect(options.documentType.arr).toEqual(documentMock.documentTypes());
        });
      });
    });

    describe('getDocumentStatus()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Document/).respond(documentFabricator.onGetOptions.documentStatus);
        promise = $q.all({
          documentStatus: documentService.getDocumentStatus()
        });
      });

      it('returns promise with array of list of document status', function () {
        promise.then(function (options) {
          expect(options.documentStatus.obj).toBeDefined();
          expect(options.documentStatus.arr).toEqual(documentMock.documentStatus());
        });
      });
    });

    describe('getOptions()', function () {
      beforeEach(function () {
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Document&json=%7B%22field%22:%22activity_type_id/).respond(documentFabricator.onGetOptions.documentTypes);
        $httpBackend.whenGET(/action=getoptions&debug=true&entity=Document&json=%7B%22field%22:%22status_id/).respond(documentFabricator.onGetOptions.documentStatus);
        promise = $q.resolve(documentService.getOptions());
      });

      it('returns promise with array of list of document types and document status', function () {
        promise.then(function (options) {
          expect(options.documentType.arr).toEqual(documentMock.documentTypes());
          expect(options.documentStatus.arr).toEqual(documentMock.documentStatus());
        });
      });
    });

    /**
     * Creates a fake promise then call
     *
     * @param  {array} data Data to pass to callback function
     */
    function fakePromise (data) {
      return function () {
        return {
          then: function (callback) {
            callback(data);
          }
        };
      };
    }
  });
});
