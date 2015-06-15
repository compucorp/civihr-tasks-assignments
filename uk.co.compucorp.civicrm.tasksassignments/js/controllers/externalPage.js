define(['controllers/controllers',
        'services/contact'], function(controllers){
    controllers.controller('ExternalPageCtrl',['$scope', '$log', '$modal', '$rootElement', '$rootScope', '$state',
        'ContactService', 'config',
        function($scope, $log, $modal, $rootElement, $rootScope, $state, ContactService, config){
            $log.debug('Controller: ExternalPageCtrl');

            $scope.assignmentsUrl = config.url.ASSIGNMENTS+'?reset=1';
            $scope.reportsUrl = config.url.CIVI_DASHBOARD+'?reset=1';

            ContactService.get({'IN': [config.LOGGED_IN_CONTACT_ID]}).then(function(data){
                ContactService.updateCache(data);
            });

            $scope.$on('assignmentFormSuccess',function(){
                $state.go($state.current, {}, {reload: true});
            });

            $scope.$on('iframe-ready',function(){
                $rootScope.$broadcast('ct-spinner-hide');
            });

        }]);
});