/* eslint-env amd */

define([
  'common/lodash',
  'common/angular',
  'common/moment'
], function (_, angular, moment) {
  'use strict';

  ModalAssignmentActivityController.$inject = ['$log', '$scope'];

  function ModalAssignmentActivityController ($log, $scope) {
    $log.debug('Controller: ModalAssignmentTaskController');

    $scope.isDisabled = !$scope.activity.activity_type_id && !$scope.activity.isAdded;
    $scope.activity.create = !$scope.isDisabled;

    (function init () {
      initWatchers();
    }());

    function initWatchers () {
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
  }

  return { ModalAssignmentActivityController: ModalAssignmentActivityController };
});
