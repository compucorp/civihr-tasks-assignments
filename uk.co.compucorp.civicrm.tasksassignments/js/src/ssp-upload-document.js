(function (CRM, require) {
  var srcPath = CRM.tasksAssignments.extensionPath + 'js/src/';

  require.config({
    urlArgs: 'bust=' + (new Date()).getTime(),
    paths: {
      'ssp-upload-document': srcPath + 'ssp-upload-document',
      'tasks-assignments': srcPath + 'tasks-assignments'
    }
  });

  require([
    'ssp-upload-document/ssp-upload-document.module'
  ],
  function (angular) {
    document.addEventListener('taReady', function () {
      angular.bootstrap(document.querySelector('[data-ssp-upload-document]'), [
        'ssp-upload-document'
      ]);
    });
  });
})(CRM, require);
