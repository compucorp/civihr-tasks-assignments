define(['controllers/controllers'], function(controllers){
    controllers.controller('SettingsCtrl',['$scope', '$rootScope', '$log', 'config',
        function($scope, $rootScope, $log, config){
            $log.debug('Controller: SettingsCtrl');

            $rootScope.$broadcast('ct-spinner-hide');

        }]);
});