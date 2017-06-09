/* globals inject */
/* eslint-env amd, jasmine */

define([
  'mocks/document',
  'mocks/contact',
  'mocks/data/assignment',
  'common/angularMocks',
  'tasks-assignments/app'
], function (documentMock, contactMock, assignmentMock) {
  'use strict';

  describe('DocumentService', function () {
    var AssignmentService, ContactService, DocumentService, $q, deferred, promise;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_AssignmentService_, _ContactService_, _DocumentService_, _$q_) {
      AssignmentService = _AssignmentService_;
      ContactService = _ContactService_;
      DocumentService = _DocumentService_;
      $q = _$q_;
      deferred = $q.defer();
    }));

    beforeEach(function () {
      spyOn(ContactService, 'get').and.callFake(fakePromise(contactMock.contactList));
      spyOn(AssignmentService, 'get').and.callFake(fakePromise(assignmentMock.assignmentList));
      spyOn(ContactService, 'updateCache').and.returnValue(deferred.promise);
      spyOn(AssignmentService, 'updateCache').and.returnValue(deferred.promise);
    });

    describe('cacheContactsAndAssignments()', function () {
      describe('needs to cache the contacts and assignments of the given documents', function () {
        beforeEach(function () {
          promise = DocumentService.cacheContactsAndAssignments(documentMock.documentList);
        });

        it('calls contact service to get details using contactIds', function () {
          expect(ContactService.get).toHaveBeenCalledWith(jasmine.objectContaining({
            'IN': ['204', '4', '205', '205', '204', '204', '205', '202', '202', '205', '3', '203', '205', '203', '203']
          }));
        });

        it('calls contact service to get details using assignmentIds', function () {
          expect(AssignmentService.get).toHaveBeenCalledWith(jasmine.objectContaining({
            'IN': ['45', '46', '49']
          }));
        });

        it('calls contact service to cache contacts', function () {
          expect(ContactService.updateCache).toHaveBeenCalled();
        });

        it('calls contact service to cache assignments', function () {
          expect(AssignmentService.updateCache).toHaveBeenCalled();
        });

        it('returns a promise', function () {
          expect(typeof(promise.then)).toEqual('function');
        });
      });

      describe('needs to cache either contacts or assignments exclusively', function () {
        describe('needs to cache only contacts', function () {
          beforeEach(function () {
            DocumentService.cacheContactsAndAssignments(documentMock.documentList, 'contacts');
          });

          it('calls contact service to cache contacts', function () {
            expect(ContactService.updateCache).toHaveBeenCalled();
          });

          it('does not call assignment service to cache contacts', function () {
            expect(AssignmentService.updateCache).not.toHaveBeenCalled();
          });
        });

        describe('needs to cache only assignments', function () {
          beforeEach(function () {
            DocumentService.cacheContactsAndAssignments(documentMock.documentList, 'assignments');
          });

          it('calls assignment service to cache assignments', function () {
            expect(AssignmentService.updateCache).toHaveBeenCalled();
          });

          it('does not calls contact service to cache assignments', function () {
            expect(ContactService.updateCache).not.toHaveBeenCalled();
          });
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
        }
      };
    };
  });
});
