const gulp = require('gulp');
const sass = require('gulp-sass');
const exec = require('child_process').exec;
const rmdir = require('rmdir');
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
  .use(mdc, 'bookmark', {
    render: function (tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<nav role="doc-toc" epub:type="toc">\n';

      } else {
        // closing tag
        return '</nav>\n';
      }
    }
  })
  .use(mdc, 'admonition', {
    validate: function (params) {
      return /^(note|info|warning|tip|danger)((\s+(.*))?)$/.test(params.trim());
    },

    render: function (tokens, idx) {

      if (tokens[idx].nesting === 1) {
        let m = tokens[idx].info.trim().match(/^(note|info|warning|tip|danger)((\s+(.*))?)$/);
        const adType = md.utils.escapeHtml(m[1]);
        const adTypeTitle = {
          note: 'Note',
          info: 'Info',
          warning: 'Warning',
          tip: 'Tip',
          danger: 'Danger'
        }[adType];
        const adTitle = md.utils.escapeHtml(m[2]) || adTypeTitle;
        // opening tag
        return `<div class="admonition ${adType}"><p class="admonition-title">${adTitle}</p>`;

      } else {
        // closing tag
        return '</div>';
      }
    }
  })
  // .use(require('markdown-it-admonition'))
  .use(require('markdown-it-anchor'), {
  })
  .use(require('markdown-it-table-of-contents'), {
    // h3タグまで目次に入れる
    includeLevel: [1, 2, 3],
    listType: 'ul',
  })
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
  const command = 'vivliostyle build --book --no-sandbox --root . src/index.html -o output/output.pdf'
  exec(command, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
};

let md2html = (callback) => {
  const src = fs.readFileSync('src/index.md', 'utf-8');
  const result = md.render(src);
  const htmlStr = fs.readFileSync('src/template.html', 'utf-8').replace('${result}', result);

  fs.writeFileSync('src/index.html', htmlStr, 'utf-8');
  callback();
};


let build = gulp.series(gulp.parallel(scss2css, md2html), html2pdf);
exports.build = build;

let clean = (callback) => {
  console.log('Removing cache directory...');
  rmdir('cache/', (err, dirs, files) => {
    if (!err) {
      console.log('removed directories')
      console.log(dirs);
      console.log('removed files')
      console.log(files);
      console.log('all files are removed');
      callback();
    } else {
      callback(err);
    }
  });
};

exports.clean = clean;

exports.watch = () => {
  gulp.watch('src/scss/*.scss', gulp.series(scss2css, html2pdf));
  gulp.watch('src/*.md', gulp.series(md2html, html2pdf));
  gulp.watch('src/js/*.js', gulp.series(md2html, html2pdf));
  gulp.watch('src/template.html', gulp.series(md2html, html2pdf));
};
