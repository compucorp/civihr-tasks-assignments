define(['controllers/controllers',
        'services/contact',
        'services/dialog',
        'services/task'], function(controllers){

    controllers.controller('ModalTaskMigrateCtrl',['$scope', '$modalInstance', '$rootScope', '$rootElement', '$q',
        '$log', '$filter', '$modal', '$dialog', '$timeout', 'AssignmentService', 'TaskService', 'Task', 'activityType',
        'ContactService', 'UtilsService', 'config',
        function($scope, $modalInstance, $rootScope, $rootElement, $q, $log, $filter, $modal, $dialog, $timeout,
                 AssignmentService, TaskService, Task, activityType, ContactService, UtilsService, config){
            $log.debug('Controller: ModalTaskMigrateCtrl');

            $scope.migrate = {};
            $scope.migrate.from = '';
            $scope.migrate.to = '';
            $scope.migrate.activityList = [];
            $scope.migrate.activityListSelected = [];
            $scope.migrate.isCheckedAll = false;

            $scope.contacts = $rootScope.cache.contact.arrSearch;
            $scope.activityType = activityType;

            $scope.getActivities = function(contactId){
                $scope.$broadcast('ct-spinner-show');

                contactId = contactId || $scope.migrate.from;
                $scope.migrate.activityList = [];

                var activityIdArr = [];

                Task.get({
                    'entity': 'ActivityContact',
                    'json': {
                        component: '',
                        'sequential': '1',
                        'return': 'activity_id',
                        'contact_id': contactId,
                        'record_type_id': '1',
                        'options': {
                            'limit': '0'
                        }
                    }
                },function(data){

                    if (data.values.length) {
                        angular.forEach(data.values,function(val){
                            this.push(val.activity_id);
                        },activityIdArr);

                        Task.get({
                            'entity': 'Activity',
                            'json': {
                                'component': '',
                                'options': {
                                    'limit': 0
                                },
                                'id': {
                                    'IN': activityIdArr
                                },
                                'is_current_revision': '1',
                                'is_deleted': '0',
                                'sequential': '1',
                                'return': 'activity_date_time, activity_type_id, assignee_contact_id, id, status_id'
                            }
                        }, function(data){

                            if (data.values.length) {

                                $scope.migrate.activityList = $filter('orderBy')(data.values,['-activity_date_time','activity_type_id']);
                            }

                            $scope.$broadcast('ct-spinner-hide');
                        });

                    }
                });
            };

            $scope.refreshContacts = function(input){
                if (!input) {
                    return
                }

                ContactService.search(input, {
                    contact_type: 'Individual'
                }).then(function(results){
                    $scope.contacts = results;
                });
            };

            $scope.cacheContact = function($item){
                var obj = {};

                obj[$item.id] = {
                    contact_id: $item.id,
                    contact_type: $item.icon_class,
                    sort_name: $item.label,
                    email: $item.description.length ? $item.description[0] : ''
                };

                ContactService.updateCache(obj);
            };

            $scope.cancel = function(){

                if ($scope.taskMigrateForm.$pristine) {
                    $modalInstance.dismiss('cancel');
                    return
                }

                $dialog.open({
                    copyCancel: 'No',
                    msg: 'Are you sure you want to cancel? Changes will be lost!'
                }).then(function(confirm){
                    if (!confirm) {
                        return
                    }

                    $scope.$broadcast('ct-spinner-hide');
                    $modalInstance.dismiss('cancel');
                });

            };

            $scope.confirm = function(){

                if (!$scope.migrate.activityListSelected.length) {
                    return
                }

                var promiseActivity = [], promisePrev, i = 0;

                $scope.$broadcast('ct-spinner-show');

                angular.forEach($scope.migrate.activityListSelected, function(activity){
                    activity.assignee_contact_id[0] = $scope.migrate.to;

                    this.push(function(){
                        var deferred = $q.defer();

                        promisePrev = i ? this[i-1] : {};

                        //fix DB deadlock issue
                        $q.when(promisePrev).then(function(){
                            Task.save({
                                'entity': 'Activity',
                                'action': 'create',
                                'json': angular.extend({
                                    'sequential': '1',
                                    'component': ''
                                },activity)
                            }, null, function(data){

                                if (UtilsService.errorHandler(data,'Unable to save task',deferred)) {
                                    return
                                }

                                deferred.resolve(data.values.length == 1 ? data.values[0] : null);
                            }, function(){
                                deferred.reject('Unable to save task');
                            });
                        });

                        return deferred.promise;
                    }.bind(this)());

                    i++;
                }, promiseActivity);

                $q.all(promiseActivity).then(function(results){
                    if (results.length) {
                        CRM.alert(results.length + ' task(s) re-assigned from: '+
                            $rootScope.cache.contact.obj[$scope.migrate.from].sort_name + ' to: '+
                            $rootScope.cache.contact.obj[$scope.migrate.to].sort_name,
                            'Migrate Tasks','success');
                    } else {
                        CRM.alert('0 tasks re-assigned.',
                            'Migrate Tasks','warning');
                    }

                    $modalInstance.dismiss();
                    $scope.$broadcast('ct-spinner-hide');
                    return;
                }, function (reason) {
                    CRM.alert(reason, 'Error', 'error');
                    $modalInstance.dismiss();
                    $scope.$broadcast('ct-spinner-hide');
                    return;
                });

            };

            $scope.toggleAll = function(){
                $scope.migrate.isCheckedAll ? $scope.migrate.activityListSelected = angular.copy($scope.migrate.activityList) : $scope.migrate.activityListSelected = [];
            };

            $scope.toggleIsCheckedAll = function() {
                $timeout(function(){
                    $scope.migrate.isCheckedAll = $scope.migrate.activityListSelected.length == $scope.migrate.activityList.length;
                });
            };

        }]);

    controllers.controller('ActivityMigrateCtrl',['$scope', '$log', '$rootScope', 'config',
        function($scope, $log, $rootScope, config){
            $log.debug('Controller: ActivityMigrateCtrl');

            var statusId = $scope.activity.status_id,
                isDocument = !!$rootScope.cache.documentType.obj[$scope.activity.activity_type_id],
                statusIdResolvedArr = !isDocument ? config.status.resolve.TASK : config.status.resolve.DOCUMENT;

            $scope.activity.cancelled = !isDocument ? statusId == 3 : false;
            $scope.activity.completed = !isDocument ? statusId == 2 : statusId == 3 || statusId == 4;
            $scope.activity.ongoing = statusIdResolvedArr.indexOf(statusId) == -1;

            $scope.activity.ongoing && $scope.$parent.migrate.activityListSelected.push($scope.activity);

        }]);
});