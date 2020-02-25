const gulp = require('gulp');
const sass = require('gulp-sass');
const exec = require('child_process').exec;
const hljs = require('highlightjs');
const mdc = require('markdown-it-container');
const kt = require('katex');
const tm = require('markdown-it-texmath').use(kt);
const md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  },
  html: true,
  linkify: true,
  typographer: true,
})
.use(mdc, 'title-page')
.use(mdc, 'note')
.use(mdc, 'info')
.use(mdc, 'tip')
.use(mdc, 'warning')
.use(mdc, 'danger')
.use(require('markdown-it-anchor'), {
  // h4タグまで目次に入れる
  includeLevel: 4,
})
.use(require('markdown-it-table-of-contents'))
.use(tm, {
  delimiters: 'dollars',
})
.use(require('./markdown-it-myplugin'));


const fs = require('fs');

let scss2css = () => {
  return gulp.src("src/scss/*.scss")
    .pipe(sass())
    .pipe(gulp.dest("src/css"))
};

let html2pdf = (callback) => {
  const command = 'vivliostyle build --root . src/index.html -o output/output.pdf'
  exec(command, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
};

let md2html = (callback) => {
  const src = fs.readFileSync('src/index.md', 'utf-8');
  const result = md.render(src);
  const htmlStr = `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title></title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/style-screen.css">
    <link rel="stylesheet" href="css/style-print.css">
    <link rel="stylesheet" href="../node_modules/highlightjs/styles/monokai-sublime.css">
    <link rel="stylesheet" href="../node_modules/katex/dist/katex.min.css">
    <link rel="stylesheet" href="../node_modules/markdown-it-texmath/css/texmath.css">
  </head>
  <body>
    ${result}
  </body>
</html>
`;

  fs.writeFileSync('src/index.html', htmlStr, 'utf-8');
  callback();
};


let build = gulp.series(gulp.parallel(scss2css, md2html), html2pdf);
exports.build = build;

exports.watch = () => {
  gulp.watch('src/scss/*.scss', gulp.series(scss2css, html2pdf));
  gulp.watch('src/*.md', gulp.series(md2html, html2pdf));
};
