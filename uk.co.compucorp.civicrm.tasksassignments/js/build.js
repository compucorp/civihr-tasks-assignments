/* eslint-disable */

({
  baseUrl : 'src',
  out: 'dist/tasks-assignments.min.js',
  name: 'tasks-assignments',
  skipModuleInsertion: true,
  paths: {
    'common': 'empty:',
    'tasks-assignments/vendor/angular-bootstrap-calendar': 'tasks-assignments/vendor/angular/angular-bootstrap-calendar-tpls-custom',
    'tasks-assignments/vendor/angular-checklist-model': 'tasks-assignments/vendor/angular/checklist-model',
    'tasks-assignments/vendor/angular-router': 'tasks-assignments/vendor/angular/angular-ui-router',
  }
},{
  baseUrl : 'src',
  out: 'dist/tasks-notification-badge.min.js',
  name: 'tasks-notification-badge',
  skipModuleInsertion: true,
  paths: {
    'common': 'empty:'
  }
})
