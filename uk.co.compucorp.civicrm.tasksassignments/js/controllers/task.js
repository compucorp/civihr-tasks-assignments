define(['controllers/controllers',        'services/task'], function(controllers){    controllers.controller('TaskCtrl',['$scope', '$log', '$filter', 'TaskService',        function($scope, $log, $filter, TaskService){            $log.debug('Controller: TaskCtrl');            $scope.isCollapsed = true;            $scope.task.activity_date_time = new Date($scope.task.activity_date_time);            $scope.$watch('task.activity_date_time',function(){                $scope.due = new Date($scope.task.activity_date_time) < new Date();            });        }]);});