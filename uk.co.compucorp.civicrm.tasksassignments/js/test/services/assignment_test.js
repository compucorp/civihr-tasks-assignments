define([
  'common/angularMocks',
  'tasks-assignments/app'
], function () {
  'use strict';

  describe('AssignmentService', function () {
    var AssignmentSearch, AssignmentService;

    beforeEach(module('civitasks.appDashboard'));
    beforeEach(inject(function (_AssignmentSearch_, _AssignmentService_) {
      AssignmentSearch = _AssignmentSearch_;
      AssignmentService = _AssignmentService_;
    }));

    describe('search()', function () {
      beforeEach(function () {
        spyOn(AssignmentSearch, 'query').and.returnValue({ '$promise': jasmine.any(Object) });
        AssignmentService.search('firstArg', 'secondArg', 'thirdArg');
      });

      it('relies internally on the AssignmentSearch', function () {
        expect(AssignmentSearch.query).toHaveBeenCalled();
      });

      it('maps the arguments to the specific endpoint parameters', function () {
        expect(AssignmentSearch.query).toHaveBeenCalledWith(jasmine.objectContaining({
          sortName: 'firstArg',
          excludeCaseIds: 'secondArg',
          includeContactIds: 'thirdArg'
        }));
      });
    });
  });
});
