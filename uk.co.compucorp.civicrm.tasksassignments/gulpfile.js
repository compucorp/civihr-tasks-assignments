var gulp = require('gulp');
var exec = require('child_process').exec;

// A very basic watch on the /js dir that triggers the RequireJS optimizer on file changes
gulp.task('requirejs-watch', function () {
    gulp.watch('js/**/*.js', function (event) {
        console.log('# Running RequireJS optimizer #')

        exec('r.js -o build.js', function (_, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
        });
    });
});

gulp.task('default', ['requirejs-watch']);
