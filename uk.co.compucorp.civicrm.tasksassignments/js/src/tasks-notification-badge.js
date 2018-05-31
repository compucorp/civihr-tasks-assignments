(function (CRM, require) {
  var extPath = CRM.tasksAssignments.extensionPath + 'js/src/tasks-notification-badge';

  require.config({
    urlArgs: 'bust=' + (new Date()).getTime(),
    paths: {
      'tasks-notification-badge': extPath
    }
  });

  require([
    'tasks-notification-badge/app'
  ],
  function (angular) {
    angular.bootstrap(
      document.querySelector('[data-tasks-notification-badge]'), ['tasks-notification-badge']
    );
  });
})(CRM, require);
