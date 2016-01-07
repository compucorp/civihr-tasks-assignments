define([
    'controllers/controllers',
    'moment',
    'services/task'
], function (controllers, moment) {
    controllers.controller('TaskCtrl', ['$scope', '$log', '$rootScope',
        function ($scope, $log, $rootScope) {
            $log.debug('Controller: TaskCtrl');

            $scope.isCollapsed = true;
            $scope.picker = {opened: false};
            $scope.task.activity_date_time = !!$scope.task.activity_date_time ? moment($scope.task.activity_date_time).toDate() : null;

            $scope.dpOpen = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
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
    ]);
});