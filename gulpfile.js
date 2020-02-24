const gulp = require('gulp');
const exec = require('child_process').exec;

let build_pdf = (callback) => {
  var command = 'vivliostyle build src/index.html'
  exec(command, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
};

gulp.task('build', build_pdf);
gulp.task('watch', () => {
  gulp.watch('src/**/*.html', build_pdf);
  gulp.watch('src/**/*.css', build_pdf);
});
