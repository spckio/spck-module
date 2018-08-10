/**
 * Created by zeb on 12/10/15.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('build', function() {
    return gulp.src(['src/main.js', 'src/**/*.js'])
        .pipe(concat('spck-module.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['build']);
