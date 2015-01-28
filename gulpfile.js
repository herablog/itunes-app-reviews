// require modules
var gulp = require('gulp');
var jshint = require('gulp-jshint');

// jshint
gulp.task('jshint', function() {
  return gulp.src('*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// watch
gulp.task('watch', function() {
  gulp.watch('*.js', ['jshint']);
});
