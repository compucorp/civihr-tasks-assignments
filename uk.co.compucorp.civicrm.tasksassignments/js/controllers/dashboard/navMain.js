define(['controllers/controllers'], function(controllers){
    controllers.controller('NavMainCtrl',['$scope', '$location', '$log',
        function($scope, $location, $log){
            $log.debug('Controller: NavMainCtrl');

            $scope.isActive = function (viewLocation) {
                return viewLocation === $location.path();
            };

        }]);
});