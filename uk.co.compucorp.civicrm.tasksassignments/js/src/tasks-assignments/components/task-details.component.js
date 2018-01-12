/* eslint-env amd */

define(function () {
  'use strict';

  var TaskDetailsComponent = {
    __name: 'taskDetails',
    bindings: {
      createdBy: '<',
      onDeleteClick: '&',
      onEditClick: '&',
      onSendReminderClick: '&',
      showMore: '<',
      status: '<',
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
  TaskDetailsController.$inject = ['$log', 'config', 'taskService'];

  function TaskDetailsController ($log, config, taskService) {
    var vm = this;

    vm.updateTask = updateTask;

    (function init () {
      vm.CONTACTS_URL = config.url.CONTACT;
      vm.CAN_DELETE_TASKS = config.permissions.allowDelete;
      convertTaskStringDateToDateObject();
    })();

    /**
     * Converts the task activity date from a string into a Date object.
     */
    function convertTaskStringDateToDateObject () {
      if (vm.task && vm.task.activity_date_time) {
        vm.task.activity_date_time = new Date(vm.task.activity_date_time);
      }
    }

    /**
     * Updates the task using the API service.
     */
    function updateTask () {
      return taskService
        .save(vm.task)
        .catch(function (reason) {
          CRM.alert(reason, 'Error', 'error');
        });
    }
  }

  return TaskDetailsComponent;
});
