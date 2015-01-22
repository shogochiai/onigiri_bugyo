var gulp = require('gulp'),
connect = require('gulp-connect');
run = require('gulp-run'),
plumber = require('gulp-plumber'),
cmq = require('gulp-combine-media-queries'),
prefix = require('gulp-autoprefixer'),
csslint = require('gulp-csslint'),
minifyHTML = require('gulp-minify-html'),
minifyCSS = require('gulp-minify-css'),
rename = require("gulp-rename"),
uglify = require('gulp-uglify'),
rev = require('gulp-rev');
usemin = require('gulp-usemin');

gulp.task('webserver', function() {
  return connect.server({
    root: 'release',
    port : 18000,
    livereload: true
  });
});

gulp.task('watch',function(){
    gulp.watch("develop/js/**/*.js",["js-task"]);
    gulp.watch("develop/lib/**/*.js",["js-lib-task"]);
    gulp.watch("develop/css/**/*.css",["css-task"]);
    return gulp.watch("develop/html/*.html",["usemin"]);
});

gulp.task("js-task", function(){
    return gulp.src("develop/js/**/*.js")
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest("release/js"))
    .pipe(connect.reload());
});

gulp.task("js-lib-task",function(){
  return gulp.src("develop/lib/**/*.js")
    .pipe(plumber())
    .pipe(gulp.dest("release/js"))
    .pipe(connect.reload());
});

gulp.task("css-task", function(){
    return gulp.src("develop/css/**/*.css")
    .pipe(plumber())
    .pipe(cmq())
    .pipe(prefix())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("release/cssmin"))
    .pipe(connect.reload());
});

gulp.task("pic-task",function(){
  return gulp.src("develop/pic/**")
    .pipe(gulp.dest("release/pic"))
    .pipe(connect.reload());
})

gulp.task('usemin', ["js-task"], function() {
  return gulp.src('develop/html/*.html')
    .pipe(usemin({
        html: [minifyHTML({empty: true})],
        css: [minifyCSS(), 'concat'],
        js:[uglify(), rev()]
    }))
    .pipe(gulp.dest('release/'));
});

gulp.task('default',
    [
        'all',
        'webserver',
        'watch'
    ]
);

gulp.task('all',
    [
        'css-task',
        'js-task',
        'js-lib-task',
        'pic-task',
        'usemin'
    ]
);
