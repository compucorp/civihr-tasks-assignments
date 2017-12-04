/* eslint-env amd */

define([
  'common/lodash',
  'common/angular',
  'common/moment',
  'tasks-assignments/services/contact.service',
  'tasks-assignments/services/document.service',
  'tasks-assignments/services/task.service',
  'tasks-assignments/services/assignment.service'
], function (_, angular, moment) {
  'use strict';

  ModalAssignmentActivityCtrl.__name = 'ModalAssignmentActivityCtrl';
  ModalAssignmentActivityCtrl.$inject = ['$scope', '$log'];

  function ModalAssignmentActivityCtrl ($scope, $log) {
    $log.debug('Controller: ModalAssignmentTaskCtrl');

    $scope.isDisabled = !$scope.activity.activity_type_id && !$scope.activity.isAdded;
    $scope.activity.create = !$scope.isDisabled;

    $scope.$watch('$parent.assignment.dueDate', function (assignmentDueDate) {
      if ($scope.activity.create) {
        $scope.activity.activity_date_time = assignmentDueDate ? moment(assignmentDueDate).add($scope.activity.offset, 'days').toDate() : null;
      }
    });

    $scope.$watch('$parent.assignment.contact_id', function (targetContactId) {
      if (targetContactId && $scope.activity.create) {
        $scope.activity.target_contact_id = [targetContactId];
      }
    });
  }

  return ModalAssignmentActivityCtrl;
});
