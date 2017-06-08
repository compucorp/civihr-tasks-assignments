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
    var AssignmentService, ContactService, DocumentService, $q, deferred;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_AssignmentService_, _ContactService_, _DocumentService_, _$q_) {
      AssignmentService = _AssignmentService_;
      ContactService = _ContactService_;
      DocumentService = _DocumentService_;
      $q = _$q_;
      deferred = $q.defer();
    }));

    describe('collectAssignmentIds()', function () {
      describe('ContactService.get()', function () {
        beforeEach(function () {
          spyOn(ContactService, 'updateCache').and.returnValue(deferred.promise);
          spyOn(ContactService, 'get').and.callFake(function () {
            return {
              then: function (callback) {
                callback(contactMock.contactList);
              }
            };
          });

          DocumentService.CacheContactsAndAssignments(documentMock.documentList, ['contacts']);
        });

        it('calls contact service to get details from contactIds', function () {
          expect(ContactService.get).toHaveBeenCalledWith(jasmine.objectContaining({
            'IN': ['204', '4', '205', '205', '204', '204', '205', '202', '202', '205', '3', '203', '205', '203', '203']
          }));
        });

        it('calls contact service to cache contacts', function () {
          expect(ContactService.updateCache).toHaveBeenCalledWith(jasmine.objectContaining(contactMock.contactList));
        });
      });

      describe('AssignmentService.get()', function () {
        beforeEach(function () {
          spyOn(AssignmentService, 'updateCache').and.returnValue(deferred.promise);
          spyOn(AssignmentService, 'get').and.callFake(function () {
            return {
              then: function (callback) {
                callback(assignmentMock.assignmentList);
              }
            };
          });

          DocumentService.CacheContactsAndAssignments(documentMock.documentList, ['assignments']);
        });

        it('calls contact service to get details from assignmentIds', function () {
          expect(AssignmentService.get).toHaveBeenCalledWith(jasmine.objectContaining({
            'IN': ['45', '46', '49']
          }));
        });

        it('calls contact service to cache assignments', function () {
          expect(AssignmentService.updateCache).toHaveBeenCalledWith(jasmine.objectContaining(assignmentMock.assignmentList));
        });
      });
    });
  });
});
