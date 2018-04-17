var TEST_REGEXP = /(spec|test)\.js$/i;
var allTestFiles = [];
var mocksPath = CRM.tasksAssignments.extensionPath + '/js/test/tasks-assignments/mocks';
var srcPath = CRM.tasksAssignments.extensionPath + '/js/src/tasks-assignments';

Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file);
  }
});

require.config({
  deps: allTestFiles,
  waitSeconds: 60,
  paths: {
    'tasks-assignments': srcPath,
    'tasks-assignments/vendor/angular-bootstrap-calendar': srcPath + '/vendor/angular/angular-bootstrap-calendar-tpls-custom',
    'tasks-assignments/vendor/angular-checklist-model': srcPath + '/vendor/angular/checklist-model',
    'tasks-assignments/vendor/angular-router': srcPath + '/vendor/angular/angular-ui-router',
    'tasks-assignments/vendor/angular-select': srcPath + '/vendor/angular/select',
    'tasks-assignments/vendor/angular-xeditable': srcPath + '/vendor/angular/xeditable',
    'tasks-assignments/vendor/angular-xeditable-civi': srcPath + '/vendor/angular/xeditable-civi',
    'tasks-assignments/vendor/text-angular': srcPath + '/vendor/angular/textAngular.min',
    'tasks-assignments/vendor/text-angular-rangy': srcPath + '/vendor/angular/textAngular-rangy.min',
    'tasks-assignments/vendor/text-angular-sanitize': srcPath + '/vendor/angular/textAngular-sanitize.min',
    'mocks': mocksPath
  },
  shim: {
    'tasks-assignments/vendor/angular-xeditable-civi': {
      deps: [
        'tasks-assignments/vendor/angular-xeditable',
        'tasks-assignments/vendor/angular-select',
        'tasks-assignments/vendor/text-angular'
      ]
    },
    'tasks-assignments/vendor/text-angular': {
      deps: [
        'tasks-assignments/vendor/text-angular-rangy',
        'tasks-assignments/vendor/text-angular-sanitize'
      ]
    }
  },
  callback: function () {
    window.__karma__.start();
  }
});
