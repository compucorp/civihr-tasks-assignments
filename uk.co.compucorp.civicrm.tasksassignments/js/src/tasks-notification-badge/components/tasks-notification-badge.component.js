/* eslint-env amd */

define([
  'common/lodash'
], function (_, components) {
  TasksNotificationBadgeController.$inject = ['$log', 'Session'];

  function TasksNotificationBadgeController ($log, Session) {
    $log.debug('Component: tasks-notification-badge');

    var vm = this;
    var taskFilters = { apiName: 'Task', params: { status_id: {'!=': 'Completed'}, is_current_revision: true } };
    var documentFilters = { apiName: 'Document', params: { status_id: 'awaiting upload', is_current_revision: true } };

    vm.$onInit = $onInit;
    vm.refreshCountEventName = 'TasksBadge:: Update Count';

    function $onInit () {
      Session.get()
        .then(function (session) {
          taskFilters.params.assignee_contact_id = session.contactId;
          documentFilters.params.assignee_contact_id = session.contactId;
          vm.filters = [taskFilters, documentFilters];
        });
    }
  }

  return {
    tasksNotificationBadge: {
      templateUrl: ['settings', function (settings) {
        return settings.baseUrl + 'components/tasks-notification-badge.html';
      }],
      controllerAs: 'tasksNotificationBadge',
      controller: TasksNotificationBadgeController
    }
  };
});
