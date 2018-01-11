/* eslint-env amd */

define(function () {
  'use strict';

  var TaskDetailsComponent = {
    __name: 'taskDetails',
    bindings: {
      createdBy: '<',
      showMore: '<',
      status: '<',
      task: '<'
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
  TaskDetailsController.$inject = ['$log', 'config'];

  function TaskDetailsController ($log, config) {
    var vm = this;

    (function init () {
      vm.CONTACTS_URL = config.url.CONTACT;
    })();
  }

  return TaskDetailsComponent;
});
