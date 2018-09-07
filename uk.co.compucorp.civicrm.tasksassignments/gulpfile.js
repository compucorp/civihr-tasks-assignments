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
  // The app style relies on compass's gems,
  // so we need to rely on it for the time being
  exec('compass compile', function (error, stdout) {
    if (error) {
      console.log(error);
    }

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

gulp.task('js-bundle:requirejs:ssp-upload', function (done) {
  exec('r.js -o js/ssp-upload-document.build.js', function (err, stdout, stderr) {
    err && err.code && console.log(stdout);
    done();
  });
});

gulp.task('watch', function () {
  gulp.watch('scss/**/*.scss', gulp.parallel('sass'));
  watchModule('ssp-upload-document', 'js-bundle:requirejs:ssp-upload');
  watchModule('tasks-notification-badge', 'js-bundle:requirejs:badge');
  watchModule('tasks-assignments', 'js-bundle:requirejs:ta');
  watchModule('crm-tasks-workflows', 'js-bundle:crm');
});

gulp.task('js-bundle:requirejs', gulp.parallel(
  'js-bundle:requirejs:ta',
  'js-bundle:requirejs:badge',
  'js-bundle:requirejs:ssp-upload'
));
gulp.task('js-bundle', gulp.parallel('js-bundle:crm', 'js-bundle:requirejs'));

var test = (function () {
  /**
   * Runs the karma server which does a single run of the test/s
   *
   * @param  {String} configFile - The full path to the karma config file
   * @param  {Function} cb - The callback to call when the server closes
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
     *
     * @return {Promise}
     */
    all: function () {
      return runServer('crm-tasks-workflows/karma.conf.js')
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
     * @param  {String} moduleName
     * @param  {String} srcFile
     * @throws {Error}
     */
    for: function (moduleName, srcFile) {
      var srcFileNoExt = path.basename(srcFile, path.extname(srcFile));
      var testFile = srcFile
        .replace('src/', 'test/')
        .replace(srcFileNoExt + '.js', srcFileNoExt + '.spec.js');

      try {
        var stats = fs.statSync(testFile);

        stats.isFile() && this.single(moduleName, testFile);
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
     * @param {String} moduleName - The module name
     * @param {String} testFile - The full path of a test file
     */
    single: function (moduleName, testFile) {
      var configFile = 'karma.' + path.basename(testFile, path.extname(testFile)) + '.conf.temp.js';

      gulp.src(path.join(__dirname, '/js/test/', moduleName, '/karma.conf.js'))
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

/**
 * Starts watching a module
 * Watches source files and launches a correspondent spec file if it exists,
 *   if not, launches all specs. Also builds distributive files.
 * Watches spec files and launches them.
 * Watches mock files and launches all specs.
 *
 * @param {String} moduleName
 * @param {String} buildTaskName
 */
function watchModule (moduleName, buildTaskName) {
  gulp.watch([
    'js/src/' + moduleName + '.js',
    'js/src/' + moduleName + '/**/*.js'
  ], gulp.parallel(buildTaskName)).on('change', function (filePath) {
    try {
      test.for(moduleName, filePath);
    } catch (ex) {
      test.all();
    }
  });
  gulp.watch([
    'js/test/' + moduleName + '/**/*.spec.js'
  ]).on('change', function (filePath) {
    test.single(moduleName, filePath);
  });
  gulp.watch([
    'js/test/' + moduleName + '/mocks/**/*.js'
  ]).on('change', function (filePath) {
    test.all();
  });
}

gulp.task('test', test.all);
gulp.task('default', gulp.parallel('js-bundle', 'sass', 'test'));
