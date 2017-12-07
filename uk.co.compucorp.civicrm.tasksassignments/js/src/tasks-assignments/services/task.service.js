/* eslint-env amd */

define([
  'common/angular',
  'common/lodash',
  'common/moment'
], function (angular, _, moment) {
  'use strict';

  taskService.__name = 'taskService';
  taskService.$inject = ['Task', '$q', 'config', 'utilsService', '$log'];

  function taskService (Task, $q, config, utilsService, $log) {
    $log.debug('Service: taskService');

    return {
      assign: function (taskArr, assignmentId) {
        if ((!taskArr || !angular.isArray(taskArr)) ||
          (!assignmentId || typeof +assignmentId !== 'number')) {
          return null;
        }

        if (!taskArr.length) {
          return taskArr;
        }

        var deferred = $q.defer();

        Task.save({ action: 'copy_to_assignment' }, {
          json: {
            id: taskArr,
            case_id: assignmentId
          } || {}
        }, function (data) {
          if (utilsService.errorHandler(data, 'Unable to assign tasks', deferred)) {
            return;
          }

          deferred.resolve(data.values);
        }, function () {
          deferred.reject('Unable to assign tasks');
        });

        return deferred.promise;
      },
      get: function (params) {
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
        }, params);

        Task.get({
          json: params
        }, function (data) {
          deferred.resolve(data.values);
        }, function () {
          deferred.reject('Unable to fetch tasks list');
        });

        return deferred.promise;
      },
      getOptions: function () {
        return $q.all({
          taskType: this.getActivityTypes(),
          taskStatus: this.getTaskStatus()
        });
      },
      getTaskStatus: function () {
        var deferredTaskStatus = $q.defer();
        var taskStatus = {
          arr: [],
          obj: {}
        };

        Task.get({
          action: 'getoptions',
          json: {
            'field': 'status_id'
          }
        }, function (data) {
          _.each(data.values, function (option) {
            taskStatus.arr.push({
              key: option.key,
              value: option.value
            });

            taskStatus.obj[option.key] = option.value;
          });

          deferredTaskStatus.resolve(taskStatus);
        });

        return deferredTaskStatus.promise;
      },
      getActivityTypes: function () {
        var deferredTaskType = $q.defer();
        var taskType = {
          arr: [],
          obj: {}
        };

        Task.get({
          action: 'getoptions',
          json: {
            'field': 'activity_type_id',
            'options': {
              'limit': 0
            }
          }
        }, function (data) {
          _.each(data.values, function (option) {
            taskType.arr.push({
              key: option.key,
              value: option.value
            });

            taskType.obj[option.key] = option.value;
          });

          deferredTaskType.resolve(taskType);
        });

        return deferredTaskType.promise;
      },
      save: function (task) {
        if (!task || typeof task !== 'object') {
          return null;
        }

        if (task.activity_date_time instanceof Date) {
          // convert to format readable by backend
          task.activity_date_time = moment(task.activity_date_time.getTime()).format('YYYY-MM-DD');
        }

        var deferred = $q.defer();
        var params = angular.extend({}, task);
        var val;

        Task.save({ action: 'create' }, {
          json: params || {}
        }, function (data) {
          if (utilsService.errorHandler(data, 'Unable to save task', deferred)) {
            return;
          }

          val = data.values;
          deferred.resolve(val.length === 1 ? val[0] : null);
        }, function () {
          deferred.reject('Unable to save task');
        });

        return deferred.promise;
      },
      saveMultiple: function (taskArr) {
        if (!taskArr || !angular.isArray(taskArr)) {
          return null;
        }

        if (!taskArr.length) {
          return taskArr;
        }

        taskArr.forEach(function (task) {
          if (task.activity_date_time instanceof Date) {
            // convert to format readable by backend
            task.activity_date_time = moment(task.activity_date_time.getTime()).format('YYYY-MM-DD');
          }
        });

        var deferred = $q.defer();

        Task.save({ action: 'create_multiple' }, {
          json: {
            task: taskArr
          } || {}
        }, function (data) {
          if (utilsService.errorHandler(data, 'Unable to save tasks', deferred)) {
            return;
          }

          deferred.resolve(data.values);
        }, function () {
          deferred.reject('Unable to save tasks');
        });

        return deferred.promise;
      },
      sendReminder: function (taskId, notes) {
        if (!taskId || typeof +taskId !== 'number') {
          return null;
        }

        var deferred = $q.defer();

        Task.save({ action: 'sendreminder' }, {
          json: {
            activity_id: taskId,
            notes: notes
          }
        }, function (data) {
          if (utilsService.errorHandler(data, 'Unable to send a reminder', deferred)) {
            return;
          }

          deferred.resolve(data);
        }, function () {
          deferred.reject('Unable to send a reminder');
        });

        return deferred.promise;
      },
      delete: function (taskId) {
        if (!taskId || typeof +taskId !== 'number') {
          return null;
        }

        var deferred = $q.defer();

        Task.delete({
          action: 'delete',
          json: {
            id: taskId
          }
        }, function (data) {
          deferred.resolve(data);
        }, function () {
          deferred.reject('Could not delete task ID: ' + taskId);
        });

        return deferred.promise;
      }
    };
  }

  return taskService;
});
