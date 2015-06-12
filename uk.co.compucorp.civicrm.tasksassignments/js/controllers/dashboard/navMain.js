define(['controllers/controllers'], function(controllers){
    controllers.controller('NavMainCtrl',['$scope', '$state', '$log',
        function($scope, $state, $log){
            $log.debug('Controller: NavMainCtrl');

            $scope.isActive = function (viewLocation) {
                return $state.includes(viewLocation);
            };

        }]);
});