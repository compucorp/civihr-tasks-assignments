define(['controllers/controllers',
        'services/settings'], function(controllers){
    controllers.controller('SettingsCtrl',['$scope', '$rootScope', '$location', '$dialog', '$log', '$state', 'SettingsService', 'config', 'settings',
        function($scope, $rootScope, $location, $dialog, $log, $state, SettingsService, config, settings){
            $log.debug('Controller: SettingsCtrl');

            this.confirmLeave = false;

            $scope.settings = angular.copy(settings);
            $scope.configureAddAssignmentBtn = !!$scope.settings.copy.button.assignmentAdd;

            $scope.confirm = function(){
                $scope.$broadcast('ct-spinner-show');
                SettingsService.set({
                    documents_tab: $scope.settings.tabEnabled.documents,
                    keydates_tab: $scope.settings.tabEnabled.keyDates,
                    add_assignment_button_title: $scope.settings.copy.button.assignmentAdd
                }).then(function(results){
                    $scope.$broadcast('ct-spinner-hide');
                    $scope.settingsForm.$pristine = true;
                },function(reason){
                    CRM.alert(reason, 'Error', 'error');
                    $scope.$broadcast('ct-spinner-hide');
                });
            };


            $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

                if ($scope.settingsForm.$pristine) {
                    return
                }

                event.preventDefault();
                $dialog.open({
                    copyCancel: 'No',
                    msg: 'Are you sure you want to leave this page? Changes will be lost!'
                }).then(function(confirm){

                    if (!confirm) {
                        $rootScope.$broadcast('$stateChangeSuccess');
                        return
                    }

                    $state.go(toState.name, toParams, {notify: false}).then(function() {
                        $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                    });
                });

            });

            $rootScope.$broadcast('ct-spinner-hide');

        }]);
});