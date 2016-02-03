define([
    'tasks-assignments/controllers/controllers',
    'tasks-assignments/services/contact',
    'tasks-assignments/services/dialog',
    'tasks-assignments/services/task'
], function (controllers) {
    'use strict';

    controllers.controller('ModalTaskMigrateCtrl',['$scope', '$modalInstance', '$rootScope', '$rootElement', '$q',
        '$log', '$filter', '$modal', '$dialog', '$timeout', 'AssignmentService', 'TaskService', 'Task', 'activityType',
        'ContactService', 'UtilsService', 'settings',
        function ($scope, $modalInstance, $rootScope, $rootElement, $q, $log, $filter, $modal, $dialog, $timeout,
                 AssignmentService, TaskService, Task, activityType, ContactService, UtilsService, settings) {
            $log.debug('Controller: ModalTaskMigrateCtrl');

            $scope.migrate = {};
            $scope.migrate.dataLoaded = false;
            $scope.migrate.from = '';
            $scope.migrate.to = '';

            $scope.migrate.task = {
                list: [],
                statusList: [],
                statusListSelected: []
            };

            $scope.migrate.document = {
                list: [],
                statusList: [],
                statusListSelected: []
            };

            $scope.contacts = $rootScope.cache.contact.arrSearch;

            $scope.getActivities = function(contactId){
                $scope.$broadcast('ct-spinner-show');

                contactId = contactId || $scope.migrate.from;

                $scope.migrate.task.statusList = [];
                $scope.migrate.task.statusListSelected = [];
                $scope.migrate.document.statusList = [];
                $scope.migrate.document.statusListSelected = [];
                $scope.migrate.dataLoaded = false;

                var activityIdArr = [];

                Task.get({
                    'entity': 'ActivityContact',
                    'json': {
                        'component': '',
                        'sequential': '1',
                        'return': 'activity_id',
                        'contact_id': contactId,
                        'record_type_id': '1',
                        'options': {
                            'limit': '0'
                        }
                    }
                },function(data){

                    if (data.values && data.values.length) {
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
                                'return': 'assignee_contact_id, activity_type_id, assignee_contact_id, id, status_id'
                            }
                        }, function(data){

                            function createStatusList(type, activity){
                                var migrateTypeObj = $scope.migrate[type]

                                migrateTypeObj.list.push(activity);

                                if (!(migrateTypeObj.statusList.indexOf(activity.status_id) > -1)) {

                                    if (!(statusResolve[type].indexOf(activity.status_id) > -1)) {
                                        migrateTypeObj.statusList.unshift(activity.status_id);
                                        migrateTypeObj.statusListSelected.push(activity.status_id);
                                    } else {
                                        migrateTypeObj.statusList.push(activity.status_id);
                                    }
                                }
                            }

                            var documentTypeObj = $rootScope.cache.documentType.obj,
                                statusResolve = {
                                    task: $rootScope.cache.taskStatusResolve,
                                    document: $rootScope.cache.documentStatusResolve
                                };

                            if (data.values && data.values.length) {

                                data.values = $filter('orderBy')(data.values, '-status_id');

                                angular.forEach(data.values, function(activity){
                                    !documentTypeObj[activity.activity_type_id] ?
                                        createStatusList('task', activity) :
                                        createStatusList('document', activity);
                                });
                            }

                            $scope.migrate.dataLoaded = true;
                            $scope.$broadcast('ct-spinner-hide');
                        });

                    } else {
                        $scope.migrate.dataLoaded = true;
                        $scope.$broadcast('ct-spinner-hide');
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

                if (!$scope.migrate.task.statusListSelected &&
                    !$scope.migrate.document.statusListSelected) {
                    return
                }

                var activityListSelected = [], promiseActivity = [], promisePrev, i = 0;

                angular.forEach($scope.migrate.task.list, function(task){
                    if ($scope.migrate.task.statusListSelected.indexOf(task.status_id) > -1) {
                        this.push(task);
                    }
                }, activityListSelected);

                if (!!+settings.tabEnabled.documents) {
                    angular.forEach($scope.migrate.document.list, function(document){
                        if ($scope.migrate.document.statusListSelected.indexOf(document.status_id) > -1) {
                            this.push(document);
                        }
                    }, activityListSelected);
                }

                $scope.$broadcast('ct-spinner-show');

                angular.forEach(activityListSelected, function(activity){
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
                        CRM.alert(results.length + ' item(s) re-assigned from: '+
                            $rootScope.cache.contact.obj[$scope.migrate.from].sort_name + ' to: '+
                            $rootScope.cache.contact.obj[$scope.migrate.to].sort_name,
                            'Migrate Tasks','success');
                    } else {
                        CRM.alert('0 items re-assigned.',
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

        }]);

});
