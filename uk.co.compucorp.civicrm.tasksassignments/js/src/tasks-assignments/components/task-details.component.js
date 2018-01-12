/* eslint-env amd */

define([
  'common/angular'
], function (angular) {
  'use strict';

  var TaskDetailsComponent = {
    __name: 'taskDetails',
    bindings: {
      createdBy: '<',
      onDeleteClick: '&',
      onEditClick: '&',
      onSendReminderClick: '&',
      showMore: '<',
      task: '<',
      taskCanBeDeleted: '<'
    },
    transclude: {
      title: 'taskTitle',
      targetContact: '?taskTargetContact',
      assignedContact: '?taskAssignedContact'
    },
    controller: TaskDetailsController,
    controllerAs: 'taskDetails',
    templateUrl: ['config', function (config) {
      return config.path.TPL + 'components/task-details.html';
    }]
  };

  TaskDetailsController.__name = 'TaskDetailsComponent';
  TaskDetailsController.$inject = ['$log', '$rootScope', 'config',
    'taskService'];

  function TaskDetailsController ($log, $rootScope, config, taskService) {
    var vm = this;

    vm.taskActivityDateTime = null;
    vm.taskStatusName = null;

    vm.updateTask = updateTask;

    (function init () {
      vm.CONTACTS_URL = config.url.CONTACT;
      vm.CAN_DELETE_TASKS = config.permissions.allowDelete;
      initTaskActivityDateTime();
      initTaskStatusName();
    })();

    /**
     * Converts the task activity date from a string into a Date object.
     */
    function initTaskActivityDateTime () {
      if (vm.task && vm.task.activity_date_time) {
        vm.taskActivityDateTime = new Date(vm.task.activity_date_time);
      }
    }

    function initTaskStatusName () {
      vm.taskStatusName = $rootScope.cache.taskStatus.obj[vm.task.status_id];
    }

    /**
     * Updates the task using the API service.
     */
    function updateTask () {
      vm.task.activity_date_time = vm.taskActivityDateTime;

      return taskService
        .save(vm.task)
        .then(function (task) {
          angular.extend(vm.task, task);
        })
        .catch(function (reason) {
          CRM.alert(reason, 'Error', 'error');
        });
    }
  }

  return TaskDetailsComponent;
});
