/* eslint-env amd, jasmine */

define([
  'common/angularMocks',
  'tasks-assignments/dashboard/tasks-assignments.dashboard.module'
], function () {
  'use strict';

  describe('assignmentService', function () {
    var Assignment, AssignmentSearch, assignmentService;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_Assignment_, _AssignmentSearch_, _assignmentService_) {
      AssignmentSearch = _AssignmentSearch_;
      assignmentService = _assignmentService_;
      Assignment = _Assignment_;
    }));

    describe('search()', function () {
      beforeEach(function () {
        spyOn(AssignmentSearch, 'query').and.returnValue({ '$promise': jasmine.any(Object) });
        assignmentService.search('firstArg', 'secondArg', [2, 3, 4]);
      });

      it('relies internally on the AssignmentSearch', function () {
        expect(AssignmentSearch.query).toHaveBeenCalled();
      });

      it('maps the first two arguments to the specific endpoint parameters', function () {
        expect(AssignmentSearch.query).toHaveBeenCalledWith(jasmine.objectContaining({
          sortName: 'firstArg',
          excludeCaseIds: 'secondArg'
        }));
      });

      it('passes to the endpoint the contact ids array as a string', function () {
        expect(AssignmentSearch.query).toHaveBeenCalledWith(jasmine.objectContaining({
          includeContactIds: '2,3,4'
        }));
      });
    });

    describe('get()', function () {
      beforeEach(function () {
        spyOn(Assignment, 'get').and.callThrough();
        assignmentService.get({ 'IN': [1, 2] });
      });

      it('calls Assignment.get with correct list of fields to be returned', function () {
        expect(Assignment.get.calls.mostRecent().args[0].json.return).toEqual([ 'case_type_id', 'contacts', 'client_id', 'contact_id', 'id', 'is_deleted', 'start_date', 'status_id', 'subject' ]);
      });
    });
  });
});
