const gulp = require('gulp');
const concat = require('gulp-concat');


const build = () => {
  return gulp.src(['src/main.js', 'src/*.js'])
    .pipe(concat('spck-module.js'))
    .pipe(gulp.dest('./dist'));
}


module.exports = {
  build
}
