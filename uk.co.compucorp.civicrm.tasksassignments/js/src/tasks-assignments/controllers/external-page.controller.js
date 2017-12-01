define([
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/services/contact'
], function (controllers) {
    'use strict';

    controllers.controller('ExternalPageCtrl',['$scope', '$log', '$uibModal', '$rootElement', '$rootScope', '$state', 'config',
        function ($scope, $log, $modal, $rootElement, $rootScope, $state, config) {
            $log.debug('Controller: ExternalPageCtrl');

            $scope.assignmentsUrl = config.url.ASSIGNMENTS+'?reset=1';
            $scope.reportsUrl = config.url.CIVI_DASHBOARD+'?reset=1';

            $scope.$on('assignmentFormSuccess',function(){
                $state.go($state.current, {}, {reload: true});
            });

            $scope.$on('iframe-ready',function(){
                $rootScope.$broadcast('ct-spinner-hide');
            });

        }]);
});
