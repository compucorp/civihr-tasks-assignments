define(['controllers/controllers'], function(controllers){
    controllers.controller('AssignmentsCtrl',['$scope', '$log', 'config',
        function($scope, $log, config){
            $log.debug('Controller: AssignmentsCtrl');

            $scope.assignmentsUrl = config.url.ASSIGNMENTS+'?reset=1&force=1&cid='+config.LOGGED_IN_CONTACT_ID;
        }]);
});