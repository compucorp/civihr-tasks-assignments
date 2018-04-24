var cv = require('civicrm-cv')({ mode: 'sync' });

module.exports = function (config) {
  var civicrmPath = cv("path -d '[civicrm.root]'")[0].value;
  var extPath = cv('path -x uk.co.compucorp.civicrm.tasksassignments')[0].value;

  config.set({
    basePath: civicrmPath,
    browsers: ['ChromeHeadless'],
    frameworks: ['jasmine'],
    files: [
      // the global dependencies
      'bower_components/angular/angular.min.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-route/angular-route.min.js',

      { pattern: extPath + '/js/src/crm-tasks-workflows/modules/*.js' },
      { pattern: extPath + '/js/src/crm-tasks-workflows/controllers/*.js' },
      { pattern: extPath + '/js/src/crm-tasks-workflows/decorators/*.js' },
      { pattern: extPath + '/js/src/crm-tasks-workflows.js' },

      // the mocked components files
      { pattern: extPath + '/js/test/crm-tasks-workflows/mocks/modules/*.js' },
      { pattern: extPath + '/js/test/crm-tasks-workflows/mocks/controllers/*.js' },
      { pattern: extPath + '/js/test/crm-tasks-workflows/mocks/data/*.js' },

      // the test files
      { pattern: extPath + '/js/test/crm-tasks-workflows/**/*.spec.js' }
    ],
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--headless',
          '--disable-gpu',
          // Without a remote debugging port, Google Chrome exits immediately.
          '--remote-debugging-port=9222'
        ]
      }
    },
    junitReporter: {
      outputDir: extPath + '/test-reports',
      useBrowserName: false,
      outputFile: 'karma.xml'
    }
  });
};
