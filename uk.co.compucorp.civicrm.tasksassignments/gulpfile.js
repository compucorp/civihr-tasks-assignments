var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var karma = require('karma');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;
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

gulp.task('js', function () {
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

gulp.task('requirejs-bundle', function (done) {
  exec('r.js -o js/build.js', function (err, stdout, stderr) {
    err && err.code && console.log(stdout);
    done();
  });
});

gulp.task('watch', function () {
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch('js/src/**/*.js', ['requirejs-bundle']).on('change', function (file) {
    try { test.for(file.path); } catch (ex) { test.all(); }
  });
  gulp.watch(['js/test/**/*.js', '!js/test/mocks/**/*.js', '!js/test/test-main.js']).on('change', function (file) {
    test.single(file.path);
  });
});

gulp.task('test', function (done) {
  test.all();
});

gulp.task('default', ['requirejs-bundle', 'sass', 'test', 'watch']);

var test = (function () {
  /**
   * Runs the karma server which does a single run of the test/s
   *
   * @param {string} configFile - The full path to the karma config file
   * @param {Function} cb - The callback to call when the server closes
   */
  function runServer (configFile, cb) {
    var reporters = argv.reporters ? argv.reporters.split(',') : ['progress'];

    new karma.Server({
      configFile: path.join(__dirname, '/js/', configFile),
      reporters: reporters,
      singleRun: true
    }, function () {
      cb && cb();
    }).start();
  }

  return {

    /**
     * Runs all the tests
     */
    all: function () {
      runServer('karma.conf.js');
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
        .replace('src/tasks-assignments/', 'test/')
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
     * @param {string} testFile - The full path of a test file
     */
    single: function (testFile) {
      var configFile = 'karma.' + path.basename(testFile, path.extname(testFile)) + '.conf.temp.js';

      gulp.src(path.join(__dirname, '/js/karma.conf.js'))
        .pipe(replace('*.spec.js', path.basename(testFile)))
        .pipe(rename(configFile))
        .pipe(gulp.dest(path.join(__dirname, '/js')))
        .on('end', function () {
          runServer(configFile, function () {
            gulp.src(path.join(__dirname, '/js/', configFile), { read: false }).pipe(clean());
          });
        });
    }
  };
})();
