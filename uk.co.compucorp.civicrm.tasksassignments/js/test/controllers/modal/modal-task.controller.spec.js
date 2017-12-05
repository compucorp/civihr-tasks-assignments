/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'common/angular',
  'common/moment',
  'common/angularMocks',
  'tasks-assignments/app'
], function (_, angular, moment) {
  'use strict';

  describe('ModalTaskCtrl', function () {
    var $controller, $q, $rootScope, $scope, HRSettings,
      data, AssignmentService;

    beforeEach(module('task-assignments.dashboard'));
    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _AssignmentService_, $httpBackend) {
      // A workaround to avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});

      $q = _$q_;
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      AssignmentService = _AssignmentService_;

      data = {};
      HRSettings = { DATE_FORMAT: 'DD/MM/YYYY' };

      initializeCaches();

      spyOn(AssignmentService, 'search').and.returnValue($q.resolve([{}, {}]));
    }));

    describe('Default due date', function () {
      describe('when the task has not a due date set', function () {
        beforeEach(function () {
          initController();
        });

        it('sets a due date automatically', function () {
          expect($scope.task.activity_date_time).toBeDefined();
        });

        it('sets the due date to today', function () {
          expect(moment($scope.task.activity_date_time).isSame(moment(), 'day')).toBe(true);
        });
      });

      describe('when the task already has due date set', function () {
        var customDate;

        beforeEach(function () {
          customDate = moment().subtract(7, 'days').toDate();
          data.activity_date_time = customDate;

          initController();
        });

        it('does not change the task due date', function () {
          expect(moment($scope.task.activity_date_time).isSame(moment(), 'day')).toBe(false);
          expect(moment($scope.task.activity_date_time).isSame(customDate)).toBe(true);
        });
      });
    });

    describe('Lookup contacts lists', function () {
      describe('when in "new task" mode', function () {
        beforeEach(function () {
          initController();
        });

        it('has the lists empty', function () {
          expect($scope.contacts.assignee).toEqual([]);
          expect($scope.contacts.target).toEqual([]);
        });
      });

      describe('when in "edit task" mode', function () {
        beforeEach(function () {
          data = { id: '2', assignee_contact_id: '3', target_contact_id: '1' };
          $rootScope.cache.contact.arrSearch = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];

          initController();
        });

        it('has the list filled with just the contacts linked to the task', function () {
          expect($scope.contacts.assignee).toEqual([{ id: '3' }]);
          expect($scope.contacts.target).toEqual([{ id: '1' }]);
        });
      });
    });

    describe('when the target contact id changes', function () {
      beforeEach(function () {
        initController();

        $scope.task.case_id = _.uniqueId();
        $scope.showFieldAssignment = true;
        $scope.$digest();

        $scope.task.target_contact_id = [_.uniqueId()];
      });

      describe('basic tests', function () {
        beforeEach(function () {
          $scope.$digest();
        });

        it('resets the assignment id', function () {
          expect($scope.task.case_id).toBe(null);
        });

        it('hides the assignment field', function () {
          expect($scope.showFieldAssignment).toBe(false);
        });
      });

      describe("contact's assignment", function () {
        describe('when the contact has been selected', function () {
          beforeEach(function () {
            AssignmentService.search.calls.reset();
            $scope.$digest();
          });

          it('queries the assignment via the contact id', function () {
            expect(AssignmentService.search).toHaveBeenCalledWith(null, null, $scope.task.target_contact_id);
          });

          it('stores the assignments', function () {
            expect(_.isEmpty($scope.assignments)).toBe(false);
          });
        });

        describe('when the contact has been deselected', function () {
          beforeEach(function () {
            $scope.task.target_contact_id = [null];
            $scope.$digest();
          });

          it('does not query the assignments', function () {
            expect(AssignmentService.search).not.toHaveBeenCalled();
          });

          it('empties the stored assignments', function () {
            expect(_.isEmpty($scope.assignments)).toBe(true);
          });
        });
      });
    });

    describe('edit mode', function () {
      var targetContactId;

      beforeEach(function () {
        targetContactId = [_.uniqueId()];
        data = { id: _.uniqueId(), target_contact_id: targetContactId };

        initController();
      });

      it("loads the target contact's assignments", function () {
        expect(AssignmentService.search).toHaveBeenCalledWith(null, null, targetContactId);
      });
    });

    function initController () {
      $controller('ModalTaskCtrl', {
        $rootScope: $rootScope,
        $scope: $scope,
        $uibModalInstance: {
          close: jasmine.createSpy('modalInstance.close'),
          dismiss: jasmine.createSpy('modalInstance.dismiss'),
          result: {
            then: jasmine.createSpy('modalInstance.result.then')
          }
        },
        data: data,
        HR_settings: HRSettings
      });
    }

    function initializeCaches () {
      $rootScope.cache = {
        assignment: { arrSearch: [] },
        contact: { arrSearch: [] }
      };
    }
  });
});
