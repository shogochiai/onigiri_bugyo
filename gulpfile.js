var gulp = require('gulp'),
connect = require('gulp-connect');

gulp.task('webserver', function() {
  return connect.server({
    root: '',
    port : 18000,
    livereload: true
  });
});

gulp.task('watch',function(){
});

gulp.task('default',
['webserver', 'watch']);
