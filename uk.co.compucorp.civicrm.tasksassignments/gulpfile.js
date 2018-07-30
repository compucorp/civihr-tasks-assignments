var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var karma = require('karma');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function (done) {
  // The app style relies on compass's gems, so we need to rely on it
  // for the time being
  exec('compass compile', function (_, stdout, stderr) {
    console.log(stdout);
    done();
  });
});

/**
 * This is a custom build process, because requirejs cannot be used here
 *
 * RequireJS could not be used because when we declare the module from PHP,
 * it excepts the module to be present synchronously.
 * https://github.com/compucorp/civihr-tasks-assignments/blob/staging/uk.co.compucorp.civicrm.tasksassignments/tasksassignments.php#L307
 *
 * More Details can be found in this proof of concept https://github.com/compucorp/civihr-tasks-assignments/pull/337
 */
gulp.task('js-bundle:crm', function () {
  return gulp.src([
    'js/src/crm-tasks-workflows/modules/*.js',
    'js/src/crm-tasks-workflows/controllers/*.js',
    'js/src/crm-tasks-workflows/decorators/*.js',
    'js/src/crm-tasks-workflows.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('crm-tasks-workflows.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('js/dist/'));
});

gulp.task('js-bundle:requirejs:ta', function (done) {
  exec('r.js -o js/tasks-assignments.build.js', function (err, stdout, stderr) {
    err && err.code && console.log(stdout);
    done();
  });
});

gulp.task('js-bundle:requirejs:badge', function (done) {
  exec('r.js -o js/tasks-notification-badge.build.js', function (err, stdout, stderr) {
    err && err.code && console.log(stdout);
    done();
  });
});

gulp.task('watch', function () {
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch([
    'js/src/tasks-assignments.js',
    'js/src/tasks-assignments/**/*.js',
    'js/src/tasks-notification-badge.js',
    'js/src/tasks-notification-badge/**/*.js'
  ], ['js-bundle:requirejs']).on('change', function (file) {
    try { test.for(file.path); } catch (ex) { test.all(); }
  });
  gulp.watch([
    'js/src/crm-tasks-workflows.js',
    'js/src/crm-tasks-workflows/**/*.js'
  ], ['js-bundle:crm']).on('change', function (file) {
    try { test.for(file.path); } catch (ex) { test.all(); }
  });
  gulp.watch([
    'js/test/crm-tasks-workflows/**/*.js',
    '!js/test/crm-tasks-workflows/mocks/**/*.js'
  ]).on('change', function (file) {
    test.single('crm-tasks-workflows', file.path);
  });
  gulp.watch([
    'js/test/tasks-assignments/**/*.js',
    '!js/test/tasks-assignments/mocks/**/*.js',
    '!js/test/tasks-assignments/test-main.js'
  ]).on('change', function (file) {
    test.single('tasks-assignments', file.path);
  });
  gulp.watch([
    'js/test/tasks-notification-badge/**/*.js',
    '!js/test/tasks-notification-badge/test-main.js'
  ]).on('change', function (file) {
    test.single('tasks-notification-badge', file.path);
  });
});

gulp.task('test', function (done) {
  test.all();
});

gulp.task('js-bundle:requirejs', ['js-bundle:requirejs:ta', 'js-bundle:requirejs:badge']);
gulp.task('js-bundle', ['js-bundle:crm', 'js-bundle:requirejs']);
gulp.task('default', ['js-bundle', 'sass', 'test', 'watch']);

var test = (function () {
  /**
   * Runs the karma server which does a single run of the test/s
   *
   * @param {string} configFile - The full path to the karma config file
   * @param {Function} cb - The callback to call when the server closes
   * @return {Promise}
   */
  function runServer (configFile, cb) {
    return new Promise(function (resolve, reject) {
      new karma.Server({
        configFile: path.join(__dirname, '/js/test/', configFile),
        singleRun: true
      }, function () {
        cb && cb();
        resolve();
      }).start();
    });
  }

  return {

    /**
     * Runs all the tests in sequence
     * @NOTE running tests in sequence improves output readability
     */
    all: function () {
      runServer('crm-tasks-workflows/karma.conf.js')
        .then(function () {
          runServer('tasks-assignments/karma.conf.js');
        })
        .then(function () {
          runServer('tasks-notification-badge/karma.conf.js');
        });
    },

    /**
     * Runs the tests for a specific source file
     *
     * Looks for a test file (*_test.js) in `test/`, using the same path
     * of the source file in `src/tasks-assignments/`
     *   i.e. src/tasks-assignments/models/model.js -> test/models/model_test.js
     *
     * @throw {Error}
     */
    for: function (srcFile) {
      var srcFileNoExt = path.basename(srcFile, path.extname(srcFile));
      var testFile = srcFile
        .replace('src/', 'test/')
        .replace(srcFileNoExt + '.js', srcFileNoExt + '.spec.js');

      try {
        var stats = fs.statSync(testFile);

        stats.isFile() && this.single(testFile);
      } catch (ex) {
        throw ex;
      }
    },

    /**
     * Runs a single test file
     *
     * It passes to the karma server a temporary config file
     * which is deleted once the test has been run
     *
     * @param {string} module - The module name
     * @param {string} testFile - The full path of a test file
     */
    single: function (module, testFile) {
      var configFile = 'karma.' + path.basename(testFile, path.extname(testFile)) + '.conf.temp.js';

      gulp.src(path.join(__dirname, '/js/test/', module, '/karma.conf.js'))
        .pipe(replace('*.spec.js', path.basename(testFile)))
        .pipe(rename(configFile))
        .pipe(gulp.dest(path.join(__dirname, '/js/test')))
        .on('end', function () {
          runServer(configFile, function () {
            gulp.src(path.join(__dirname, '/js/test', configFile), { read: false }).pipe(clean());
          });
        });
    }
  };
})();
