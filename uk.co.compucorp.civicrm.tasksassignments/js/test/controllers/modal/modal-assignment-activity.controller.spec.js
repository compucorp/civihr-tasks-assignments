/* eslint-env amd, jasmine */

define([
  'common/lodash',
  'common/angular',
  'mocks/data/assignment.data'
], function (_, angular, Mock) {
  describe('ModalAssignmentActivityController', function () {
    var $controller, scope;

    beforeEach(module('tasks-assignments.dashboard'));
    beforeEach(inject(function (_$controller_, $httpBackend, $rootScope) {
      $httpBackend.whenPOST(/action=/).respond({});
      $httpBackend.whenGET(/action=/).respond({});

      $controller = _$controller_;

      scope = $rootScope.$new();
      scope.activity = Mock.taskList[0];
      scope.$parent.assignment = {
        contact_id: 1,
        dueDate: '2017-01-01'
      };

      initController();
    }));

    describe('watching assignment properties', function () {
      describe('assignment due date', function () {
        var oldDate;

        beforeEach(function () {
          oldDate = scope.activity.activity_date_time;
          scope.$parent.assignment.dueDate = '2017-10-10';
        });

        describe('when the task is enabled', function () {
          beforeEach(function () {
            scope.activity.create = true;
            scope.$digest();
          });

          it('updates the task date', function () {
            expect(scope.activity.activity_date_time).not.toBe(oldDate);
          });
        });

        describe('when the task is not enabled', function () {
          beforeEach(function () {
            scope.activity.create = false;
            scope.$digest();
          });

          it('does not update the task date', function () {
            expect(scope.activity.activity_date_time).toBe(oldDate);
          });
        });
      });

      describe('assignment contact id', function () {
        var oldContactId;

        beforeEach(function () {
          oldContactId = scope.activity.target_contact_id;
          scope.$parent.assignment.contact_id = _.uniqueId();
        });

        describe('when the task is enabled', function () {
          beforeEach(function () {
            scope.activity.create = true;
            scope.$digest();
          });

          it('updates the task target contact id', function () {
            expect(scope.activity.target_contact_id).toEqual([scope.$parent.assignment.contact_id]);
          });
        });

        describe('when the task is not enabled', function () {
          beforeEach(function () {
            scope.activity.create = false;
            scope.$digest();
          });

          it('does not update the task target contact id', function () {
            expect(scope.activity.target_contact_id).toBe(oldContactId);
            expect(scope.activity.target_contact_id).not.toEqual([scope.$parent.assignment.contact_id]);
          });
        });
      });
    });

    function initController () {
      $controller('ModalAssignmentActivityController', {
        $scope: scope
      });
    }
  });
});
