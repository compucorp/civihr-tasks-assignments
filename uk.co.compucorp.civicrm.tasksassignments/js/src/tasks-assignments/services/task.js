define([
    'tasks-assignments/services/services',
    'tasks-assignments/services/utils'
], function (services) {
    'use strict';

    services.factory('Task',['$resource', 'config', '$log', function ($resource, config, $log) {
        $log.debug('Service: Task');

        return $resource(config.url.REST,{
            'action': 'get',
            'entity': 'Task',
            'json': {}
        });

    }]);

    services.factory('TaskService',['Task', '$q', 'config', 'UtilsService', '$log',
        function (Task, $q, config, UtilsService, $log) {
        $log.debug('Service: TaskService');

        return {
            assign: function(taskArr, assignmentId){

                if ((!taskArr || !angular.isArray(taskArr)) ||
                    (!assignmentId || typeof +assignmentId !== 'number')) {
                    return null;
                }

                if (!taskArr.length) {
                    return taskArr;
                }

                var deferred = $q.defer();

                Task.save({
                    action: 'copy_to_assignment',
                    json: {
                        sequential: 1,
                        debug: config.DEBUG,
                        id: taskArr,
                        case_id: assignmentId
                    }
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to assign tasks',deferred)) {
                        return
                    }

                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to assign tasks');
                });

                return deferred.promise;
            },
            get: function(params){
                var deferred = $q.defer();

                params = params && typeof params === 'object' ? params : {};

                params = angular.extend({
                    'component': 'CiviTask',
                    'options': {
                        'limit': 0
                    },
                    'is_current_revision': '1',
                    'is_deleted': '0',
                    'sequential': '1',
                    'return': 'activity_date_time, activity_type_id, assignee_contact_id, details, id, source_contact_id, target_contact_id, subject, status_id'
                },params);

                Task.get({json: params}, function(data){
                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to fetch tasks list');
                });

                return deferred.promise;
            },
            getOptions: function(){
                var deferred = $q.defer(),
                    deferredTaskType = $q.defer(),
                    deferredTaskStatus = $q.defer(),
                    taskType = {
                        arr: [],
                        obj: {}
                    },
                    taskStatus = {
                        arr: [],
                        obj: {}
                    }

                Task.get({
                    action: 'getoptions',
                    json: {
                        'field': 'activity_type_id'
                    }
                }, function(data){
                    var optionId;

                    for (optionId in data.values) {
                        taskType.arr.push({
                            key: optionId,
                            value: data.values[optionId]
                        })
                    }

                    taskType.obj = data.values;

                    deferredTaskType.resolve(taskType);
                });

                Task.get({
                    action: 'getoptions',
                    json: {
                        'field': 'status_id'
                    }
                }, function(data){
                    var optionId;

                    for (optionId in data.values) {
                        taskStatus.arr.push({
                            key: optionId,
                            value: data.values[optionId]
                        })
                    }

                    taskStatus.obj = data.values;

                    deferredTaskStatus.resolve(taskStatus);
                });

                $q.all({
                    taskType: deferredTaskType.promise,
                    taskStatus: deferredTaskStatus.promise
                }).then(function(options){
                    deferred.resolve(options);
                });

                return deferred.promise;
            },
            save: function(task){

                if (!task || typeof task !== 'object') {
                    return null;
                }

                var deferred = $q.defer(),
                    params = angular.extend({
                        sequential: 1,
                        debug: config.DEBUG
                    },task),
                    val;

                Task.save({
                    action: 'create',
                    json: params
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to save task',deferred)) {
                        return
                    }

                    val = data.values;
                    deferred.resolve(val.length == 1 ? val[0] : null);
                },function(){
                    deferred.reject('Unable to save task');
                });

                return deferred.promise;
            },
            saveMultiple: function(taskArr){

                if (!taskArr || !angular.isArray(taskArr)) {
                    return null;
                }

                if (!taskArr.length) {
                    return taskArr;
                }

                var deferred = $q.defer();

                Task.save({
                    action: 'create_multiple',
                    json: {
                        sequential: 1,
                        debug: config.DEBUG,
                        task: taskArr
                    }
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to save tasks',deferred)) {
                        return
                    }

                    deferred.resolve(data.values);
                },function(){
                    deferred.reject('Unable to save tasks');
                });

                return deferred.promise;
            },
            sendReminder: function(taskId, notes){

                if (!taskId || typeof +taskId !== 'number') {
                    return null;
                }

                var deferred = $q.defer();

                Task.save({
                    action: 'sendreminder',
                    json: {
                        sequential: 1,
                        debug: config.DEBUG,
                        activity_id: taskId,
                        notes: notes || ''
                    }
                }, null, function(data){

                    if (UtilsService.errorHandler(data,'Unable to send a reminder',deferred)) {
                        return
                    }

                    deferred.resolve(data);
                },function(){
                    deferred.reject('Unable to send a reminder');
                });

                return deferred.promise;
            },
            delete: function(taskId) {

                if (!taskId || typeof +taskId !== 'number') {
                    return null;
                }

                var deferred = $q.defer();

                Task.delete({
                    action: 'delete',
                    json: { id: taskId }
                }, function(data){
                    deferred.resolve(data);
                },function(){
                    deferred.reject('Could not delete task ID: '+taskId);
                });

                return deferred.promise;
            }
        }

    }]);

});
