define(['controllers/controllers'], function(controllers){    controllers.controller('TaskCtrl',['$scope', '$log',        function($scope, $log){            $log.debug('Controller: TaskCtrl');            $scope.isCollapsed = true;        }]);});