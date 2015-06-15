define(['controllers/controllers',
        'services/settings'], function(controllers){
    controllers.controller('SettingsCtrl',['$scope', '$rootScope', '$log', 'SettingsService', 'config',
        function($scope, $rootScope, $log, SettingsService, config){
            $log.debug('Controller: SettingsCtrl');



            $rootScope.$broadcast('ct-spinner-hide');

        }]);
});