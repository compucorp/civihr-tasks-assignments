define([
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/services/settings'
], function (controllers) {
    'use strict';

    controllers.controller('SettingsCtrl',['$scope', '$rootScope', '$rootElement', '$location', '$dialog', '$q',
        '$log', '$state', '$uibModal', 'SettingsService', 'Task', 'config', 'settings',
        function ($scope, $rootScope, $rootElement, $location, $dialog, $q, $log, $state, $modal, SettingsService,
                 Task, config, settings) {
            $log.debug('Controller: SettingsCtrl');

            $scope.settings = angular.copy(settings);
            $scope.configureAddAssignmentBtn = !!$scope.settings.copy.button.assignmentAdd;

            var promiseActivityTypes = (function(){
                var deferred = $q.defer();

                Task.get({
                    'entity': 'Activity',
                    'action': 'getoptions',
                    'json': {
                        'field': 'activity_type_id'
                    }
                },function(data){
                    deferred.resolve(data.values || []);
                },function(){
                    deferred.reject('Unable to get activity types');
                });

                return deferred.promise;
            })();

            $scope.modalTaskMigrate = function() {
                $modal.open({
                    appendTo: $rootElement.find('div').eq(0),
                    templateUrl: config.path.TPL+'modal/taskMigrate.html?v=1',
                    controller: 'ModalTaskMigrateCtrl',
                    resolve: {
                        activityType: function() {
                            return promiseActivityTypes;
                        }
                    }
                }).result.then(function(results){
                        $scope.$broadcast('taskMigrateFormSuccess', results);
                    }, function(){
                        $log.info('Modal dismissed');
                    });

            };

            $scope.confirm = function(){
                $scope.$broadcast('ct-spinner-show');
                SettingsService.set({
                    documents_tab: $scope.settings.tabEnabled.documents,
                    keydates_tab: $scope.settings.tabEnabled.keyDates,
                    add_assignment_button_title: $scope.settings.copy.button.assignmentAdd,
                    is_task_dashboard_default: $scope.settings.isTaskDashboardDefault,
                    days_to_create_a_document_clone: $scope.settings.daysToCreateADocumentClone
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
