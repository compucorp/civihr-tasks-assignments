module.exports = function (config) {
    var civicrmPath = '../../../../../';
    var civihrPath = 'tools/extensions/civihr/';
    var extPath = 'tools/extensions/civihr_tasks/uk.co.compucorp.civicrm.tasksassignments/';

    config.set({
        basePath: civicrmPath,
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        files: [
            // the global dependencies
            'packages/jquery/jquery-1.11.1.js',
            'packages/jquery/jquery-ui/jquery-ui.js',
            'packages/backbone/lodash.compat.js',
            'packages/jquery/plugins/jquery.mousewheel.js',
            'packages/jquery/plugins/select2/select2.js',
            'packages/jquery/plugins/jquery.blockUI.js',
            'js/Common.js',
            'js/crm.ajax.js',

            // Global variables that need to be accessible in the test environment
            extPath + 'js/test/globals.js',

            // manual loading of requirejs as to avoid interference with the global dependencies above
            extPath + 'node_modules/requirejs/require.js',
            extPath + 'node_modules/karma-requirejs/lib/adapter.js',

            // all the common/ dependencies
            civihrPath + 'org.civicrm.reqangular/dist/reqangular.min.js',

            // the application modules
            { pattern: extPath + 'js/src/tasks-assignments/**/*.js', included: false },

            // the mocked components files
            { pattern: extPath + 'js/test/mocks/**/*.js', included: false },

            // the test files
            { pattern: extPath + 'js/test/**/*_test.js', included: false },

            // angular templates
            extPath + 'views/**/*.html',

            // the requireJS config file that bootstraps the whole test suite
            extPath + 'js/test/test-main.js'
        ],
        exclude: [
            extPath + 'js/src/tasks-assignments.js'
        ],
        // Used to transform angular templates in JS strings
        preprocessors: (function (obj) {
            obj[extPath + 'views/**/*.html'] = ['ng-html2js'];
            return obj;
        })({}),
        ngHtml2JsPreprocessor: {
            prependPrefix: '/base/',
            moduleName: 'tasks-assignments.templates'
        }
    });
};
