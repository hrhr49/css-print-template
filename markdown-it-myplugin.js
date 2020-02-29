/* 各種ダイアグラムなどを埋め込むプラグイン */
/* 特にキャッシュなどは行わないので遅い */
const execSync = require('child_process').execSync;
const escape = require('escape-html');
const crypto = require('crypto');
const fs = require('fs');

let calcCacheName = (langName, code, ext) => {
  const digest = crypto.createHash('sha1').update(code).digest('hex');
  return `${langName}-${digest}.${ext}`
};

let myPlugin = (md, options) => {

  // もともとのフェンスレンダリング処理を取得(thisキーワードへの対策のためbindを使用する)
  const defautFenceFunction = md.renderer.rules.fence.bind(md.renderer.rules);

  md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';
    let langName = '';

    const useCache = options.useCache !== undefined ? options.useCache : true;

    if (info) {
      langName = info.split(/\s+/g)[0];
    }

    let code = token.content;
    let command = '';
    let ext = '';

    // コードブロックの言語がdotならimgタグを作成して返す
    switch (langName) {
      case 'dot':
        command = 'dot -Tsvg';
        ext = 'svg'
        break;
      case 'ditaa':
        // 全角文字の直後にスペースをつけて幅を揃える
        code = code.replace(/([^\x01-\x7E])/g, '$1 ');
        command = 'ditaa --svg --no-separation --no-shadows -';
        ext = 'svg'

        break;
      case 'plantuml':
        command = 'plantuml -tsvg -pipe';
        ext = 'svg'
        break;
      default:
        break;
    }

    if (command) {
      if (useCache) {

        try {
          // cacheディレクトリの作成
          if (!fs.existsSync('cache')) {
            fs.mkdirSync('cache');
          }

          const cacheName = `cache/${calcCacheName(langName, code, ext)}`;

          // キャッシュがある場合は処理を実行しない
          if (!fs.existsSync(cacheName)) {
            console.log(`${cacheName} is not exists. Creating it ...`);
            const output = execSync(command, {input: code});
            fs.writeFileSync(cacheName, output, 'utf-8');
          }
          else {
            console.log(`${cacheName} is already exists. Use this cache.`);
          }
          const tag = `<img src="../${cacheName}" />`
          return tag;
        }
        catch (ex) {
          const escapedErrStr = escape(ex);
          const tag = `<pre>${escapedErrStr}</pre>`
          return tag;
        }
      }
      else {
        // コマンドを実行してbase64形式にしてimgタグに入れる
        try {
          const output = execSync(command, {input: code});
          const b64 = output.toString('base64');
          const tag = `<img src="data:image/png;base64,${b64}" />`
          return tag;
        } catch (ex) {
          const escapedErrStr = escape(ex);
          const tag = `<pre>${escapedErrStr}</pre>`
          return tag;
        }
      }
    }

    if (langName === 'mermaid') {
      return `<div class="mermaid">${code}</div>`;
    }

    // デフォルトの処理を行う
    return defautFenceFunction(tokens, idx, options, env, slf);
  }
};

module.exports = myPlugin;
