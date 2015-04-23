define(['controllers/controllers',
        'moment',
        'services/task'], function(controllers, moment){
    controllers.controller('TaskCtrl',['$scope', '$log', '$rootScope', '$filter', '$timeout', 'TaskService',
        function($scope, $log, $rootScope, $filter, $timeout, TaskService){
            $log.debug('Controller: TaskCtrl');

            $scope.isCollapsed = true;
            $scope.task.activity_date_time = moment($scope.task.activity_date_time).toDate();

            $scope.changeStatus = function(statusId){
                TaskService.save({
                    id: $scope.task.id,
                    status_id: statusId || '2'
                }).then(function(results){
                    $scope.task.status_id = results.status_id;
                })
            }

            $scope.$watch('task.status_id',function(statusId){
                var isResolved = $rootScope.cache.taskStatusResolve.indexOf(statusId) > -1;
                $scope.task.resolved = isResolved;
                $scope.task.completed = isResolved;
            });

            $scope.$watch('task.activity_date_time',function(taskDateTime){
                $scope.task.due = new Date(taskDateTime).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
            });

        }]);
});