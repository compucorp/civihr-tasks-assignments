/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'common/angular',
  'common/moment',
  'common/angularMocks',
  'tasks-assignments/dashboard/tasks-assignments.dashboard.module'
], function (_, angular, moment) {
  'use strict';

  describe('ModalTaskController', function () {
    var $controller, $q, $rootScope, $scope, HRSettings,
      data, assignmentService, crmAngService;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _assignmentService_, _crmAngService_, $httpBackend) {
      // A workaround to avoid actual API calls
      $httpBackend.whenGET(/action=/).respond({});

      $q = _$q_;
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      assignmentService = _assignmentService_;
      crmAngService = _crmAngService_;

      data = {};
      HRSettings = { DATE_FORMAT: 'DD/MM/YYYY' };

      initializeCaches();

      spyOn(assignmentService, 'search').and.returnValue($q.resolve([{}, {}]));
    }));

    describe('modalTitle', function () {
      describe('when creating new task', function () {
        beforeEach(function () {
          initController();
        });

        it('sets the modal title as "New Task"', function () {
          expect($scope.modalTitle).toBe('New Task');
        });
      });

      describe('when editing an existing task', function () {
        beforeEach(function () {
          data.id = '1';
          initController();
        });

        it('sets the document modal title to "Edit Task"', function () {
          expect($scope.modalTitle).toBe('Edit Task');
        });
      });
    });

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
            assignmentService.search.calls.reset();
            $scope.$digest();
          });

          it('queries the assignment via the contact id', function () {
            expect(assignmentService.search).toHaveBeenCalledWith(null, null, $scope.task.target_contact_id);
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
            expect(assignmentService.search).not.toHaveBeenCalled();
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
        expect(assignmentService.search).toHaveBeenCalledWith(null, null, targetContactId);
      });
    });

    describe('when user clicks on the task wrench icon', function () {
      var url;

      beforeEach(function () {
        url = '/civicrm/admin/options/activity_type?reset=1';

        spyOn(crmAngService, 'loadForm').and.returnValue({
          on: function (event, callback) {}
        });
        initController();
        $scope.task.openActivityTypeOptionsEditor();
      });

      it('calls crmAngService with the required url', function () {
        expect(crmAngService.loadForm).toHaveBeenCalledWith(url);
      });
    });

    function initController () {
      $controller('ModalTaskController', {
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
