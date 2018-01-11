/* eslint-env amd */

define(function () {
  'use strict';

  var TaskDetailsComponent = {
    __name: 'taskDetails',
    bindings: {
      task: '<',
      showMore: '<'
    },
    transclude: {
      title: '?taskDetailsTitle',
      targetContact: '?taskDetailsTargetContact',
      assignedContact: '?taskDetailsAssignedContact'
    },
    controller: TaskDetailsController,
    controllerAs: 'taskDetails',
    templateUrl: ['config', function (config) {
      return config.path.TPL + 'components/task-details.html';
    }]
  };

  TaskDetailsController.__name = 'TaskDetailsComponent';
  TaskDetailsController.$inject = ['$log'];

  function TaskDetailsController ($log) {
    $log.info('Component: TaskDetailsComponent');
  }

  return TaskDetailsComponent;
});
