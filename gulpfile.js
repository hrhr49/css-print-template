const gulp = require('gulp');
const sass = require('gulp-sass');
const exec = require('child_process').exec;

let scss2css = () => {
  return gulp.src("src/scss/*.scss")
    .pipe(sass())
    .pipe(gulp.dest("src/css"))
};

let html2pdf = (callback) => {
  var command = 'vivliostyle build src/index.html -o output/output.pdf'
  exec(command, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
};


let build = gulp.series(scss2css, html2pdf);

exports.build = build;
exports.watch = () => {
  gulp.watch(['src/scss/*.scss', 'src/*.html'], build);
};


// gulp.task('build', build_pdf);
// gulp.task('watch', () => {
//   gulp.watch('scss/*.scss', build_css);
//   gulp.watch('src/**/*.html', build_pdf);
//   gulp.watch('css/*.css', build_pdf);
// });

