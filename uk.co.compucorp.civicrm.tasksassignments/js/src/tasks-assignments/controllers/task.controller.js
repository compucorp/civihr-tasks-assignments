/* eslint-env amd */

define([
  'common/moment'
], function (moment, controllers) {
  'use strict';

  TaskCtrl.__name = 'TaskCtrl';
  TaskCtrl.$inject = ['$scope', '$log', '$rootScope'];

  function TaskCtrl ($scope, $log, $rootScope) {
    $log.debug('Controller: TaskCtrl');

    $scope.isCollapsed = true;
    $scope.picker = { opened: false };
    $scope.task.activity_date_time = $scope.task.activity_date_time ? moment($scope.task.activity_date_time).toDate() : null;

    $scope.dpOpen = function ($event) {
      $scope.picker.opened = true;
    };

    $scope.$watch('task.status_id', function (statusId) {
      var isResolved = $rootScope.cache.taskStatusResolve.indexOf(statusId) > -1;
      $scope.task.resolved = isResolved;
      $scope.task.completed = isResolved;
    });

    $scope.$watch('task.activity_date_time', function (taskDateTime) {
      $scope.task.due = new Date(taskDateTime).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
    });
  }

  return TaskCtrl;
});
