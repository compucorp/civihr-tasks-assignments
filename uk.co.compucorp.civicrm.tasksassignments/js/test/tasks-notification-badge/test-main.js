var TEST_REGEXP = /(spec|test)\.js$/i;
var allTestFiles = [];
var srcPath = CRM.tasksAssignments.extensionPath + '/js/src/tasks-notification-badge';

Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file);
  }
});

require.config({
  deps: allTestFiles,
  waitSeconds: 60,
  paths: {
    'tasks-notification-badge': srcPath
  },
  callback: function () {
    window.__karma__.start();
  }
});
