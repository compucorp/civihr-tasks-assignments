/* eslint-env amd */

define([
  'common/lodash',
  'tasks-notification-badge/modules/components'
], function (_, components) {
  components.component('tasksNotificationBadge', {
    templateUrl: ['settings', function (settings) {
      return settings.pathTpl + 'components/tasks-notification-badge.html';
    }],
    controllerAs: 'tasksNotificationBadge',
    controller: TasksNotificationBadgeController
  });

  TasksNotificationBadgeController.$inject = ['$log', 'Session'];

  function TasksNotificationBadgeController ($log, Session) {
    $log.debug('Component: tasks-notification-badge');

    var vm = this;
    var taskFilters = { apiName: 'Task', params: { status_id: {'!=': 'Completed'} } };
    var documentFilters = { apiName: 'Document', params: { status_id: 'awaiting upload', is_current_revision: true } };

    vm.refreshCountEventName = 'TasksBadge:: Update Count';

    (function init () {
      Session.get()
        .then(function (session) {
          taskFilters.params.assignee_contact_id = session.contactId;
          documentFilters.params.assignee_contact_id = session.contactId;
          vm.filters = [taskFilters, documentFilters];
        });
    })();
  }
});
