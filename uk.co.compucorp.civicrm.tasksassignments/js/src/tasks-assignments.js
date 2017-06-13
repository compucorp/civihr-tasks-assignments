(function () {
  var extPath = CRM.tasksAssignments.extensionPath + 'js/src/tasks-assignments';

  require.config({
    urlArgs: 'bust=' + (new Date()).getTime(),
    paths: {
      'tasks-assignments': extPath,
      'tasks-assignments/vendor/angular-bootstrap-calendar': extPath + '/vendor/angular/angular-bootstrap-calendar-tpls-custom',
      'tasks-assignments/vendor/angular-checklist-model': extPath + '/vendor/angular/checklist-model',
      'tasks-assignments/vendor/angular-router': extPath + '/vendor/angular/angular-ui-router',
    }
  });

  require(['tasks-assignments/app']);
})(require);
