define(['controllers/controllers',
        'services/file'], function(controllers){
    controllers.controller('MainCtrl',['$scope', '$rootScope', '$rootElement', '$log', '$modal', '$q', 'FileService',
        'Task', 'config', 'settings',
        function($scope, $rootScope, $rootElement, $log, $modal, $q, FileService, Task, config, settings){
            $log.debug('Controller: MainCtrl');

            $rootScope.modalDocument = function(data, e) {
                e && e.preventDefault();

                var data = data || {},
                    modalInstance = $modal.open({
                        targetDomEl: $rootElement.find('div').eq(0),
                        templateUrl: config.path.TPL+'modal/document.html?v=1',
                        controller: 'ModalDocumentCtrl',
                        resolve: {
                            data: function(){
                                return data;
                            },
                            files: function(){

                                if (!data.id || !+data.file_count) {
                                    return [];
                                }

                                return FileService.get(data.id,'civicrm_activity')
                            }
                        }
                    });

                modalInstance.result.then(function(results){
                    $scope.$broadcast('documentFormSuccess', results, data);
                }, function(){
                    $log.info('Modal dismissed');
                });
            };

            $rootScope.modalTask = function(data) {
                var data = data || {},
                    modalInstance = $modal.open({
                        targetDomEl: $rootElement.find('div').eq(0),
                        templateUrl: config.path.TPL+'modal/task.html?v=1',
                        controller: 'ModalTaskCtrl',
                        resolve: {
                            data: function(){
                                return data;
                            }
                        }
                    });

                modalInstance.result.then(function(results){
                    $scope.$broadcast('taskFormSuccess', results, data);
                }, function(){
                    $log.info('Modal dismissed');
                });

            };

            $rootScope.modalTaskMigrate = function() {
                $modal.open({
                    targetDomEl: $rootElement.find('div').eq(0),
                    templateUrl: config.path.TPL+'modal/taskMigrate.html?v='+(new Date().getTime()),
                    controller: 'ModalTaskMigrateCtrl',
                    resolve: {
                        activityType: function(){
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
                        }
                    }
                }).result.then(function(results){
                    $scope.$broadcast('taskMigrateFormSuccess', results);
                }, function(){
                    $log.info('Modal dismissed');
                });

            };

            $rootScope.modalAssignment = function(data) {
                var data = data || {},
                    modalInstance = $modal.open({
                        targetDomEl: $rootElement.find('div').eq(0),
                        templateUrl: config.path.TPL+'modal/assignment.html?v=1',
                        controller: 'ModalAssignmentCtrl',
                        size: 'lg',
                        resolve: {
                            data: function(){
                                return data;
                            }
                        }
                    });

                modalInstance.result.then(function(results){
                    $scope.$broadcast('assignmentFormSuccess', results, data);
                }, function(){
                    $log.info('Modal dismissed');
                });

            };

            $rootScope.modalReminder = function(data, type) {

                if (!data || typeof data !== 'object' ||
                    !type || typeof type !== 'string') {
                    return null;
                }

                $modal.open({
                    targetDomEl: $rootElement.find('div').eq(0),
                    templateUrl: config.path.TPL+'modal/reminder.html?v=1',
                    controller: 'ModalReminderCtrl',
                    resolve: {
                        data: function(){
                            return data;
                        },
                        type: function(){
                            return type
                        }
                    }
                });
            };

        }]);
});