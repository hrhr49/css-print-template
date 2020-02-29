/* 各種ダイアグラムなどを埋め込むプラグイン       */
/*                                                */
/* オプションの指定方法                           */
/* コードフェンスの名前のあとにJSON形式で指定する */
/* 例                                             */
/* ```dita {"ext": "png, "width": 100}            */
/* オプション一覧                                 */
/* ext: 図を保存するときの拡張子                  */
/* width: 図の幅                                  */
/* height: 図の高さ                               */

/* 特にキャッシュなどは行わないので遅い */
const execSync = require('child_process').execSync;
const escape = require('escape-html');
const crypto = require('crypto');
const fs = require('fs');

// キャッシュとして作成するファイル名を算出する
let calcCacheName = (content, ext) => {
  const digest = crypto.createHash('sha1').update(JSON.stringify(content)).digest('hex');
  return `${digest}.${ext}`
};

// 各コードフェンスでのオプションのデフォルト値
const defaultOptions = {
  ditaa: {
    ext: 'svg',
  },

  dot: {
    ext: 'svg',
  },

  plantuml: {
    ext: 'svg',
  }
};

// 変換対象の名前と変換処理の対応づけ
const renderFunctions = {
  ditaa: (code, options) => {
    const ext = options.ext || defaultOptions.ditaa.ext;
    const validExtList = ["png", "svg"];

    if ( validExtList.indexOf(ext) == -1 ) {
      throw `extension "${ext}" is invalid for ditaa code fence`;
    }

    // 全角文字の直後にスペースをつけて幅を揃える
    const paddedCode = code.replace(/([^\x01-\x7E]+)/g, (match) => {
      let padded = match;
      for (let i = 0; i < match.length; i++) {
        padded += '\u200B'; // zero width space
        // padded += ' ';
      }
      return padded;
    });

    const extCmdOption = ext === 'svg' ? '--svg' : '';
    const command = `ditaa ${extCmdOption} --no-separation --no-shadows -`;
    const output = execSync(command, {input: paddedCode});
    return output;
  },

  dot: (code, options) => {
    const ext = options.ext || defaultOptions.dot.ext;
    const validExtList = ["png", "jpg", "jpeg", "svg"];

    if ( validExtList.indexOf(ext) == -1 ) {
      throw `extension "${ext}" is invalid for dot code fence`;
    }
    const command = `dot -T${ext}`;
    const output = execSync(command, {input: code});
    return output;
  },
  plantuml: (code, options) => {
    const ext = options.ext || defaultOptions.plantuml.ext;
    const validExtList = ["png", "jpg", "jpeg", "svg"];

    if ( validExtList.indexOf(ext) == -1 ) {
      throw `extension "${ext}" is invalid for plantuml code fence`;
    }
    const command = `plantuml -t${ext} -pipe`;
    const output = execSync(command, {input: code});
    return output;
  }
};

let myPlugin = (md, options) => {

  // もともとのフェンスレンダリング処理を取得(thisキーワードへの対策のためbindを使用する)
  const defautFenceFunction = md.renderer.rules.fence.bind(md.renderer.rules);

  md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';
    let langName = '';
    let fenceOptions = {};
    let isTarget = false;

    if (info) {
      langName = info.split(/\s+/g)[0];
    }

    isTarget = langName in renderFunctions;

    if (isTarget) {
      const fenceOptionsStr = info.substring(langName.length).trim();
      if (fenceOptionsStr) {
        fenceOptions = JSON.parse(fenceOptionsStr);
      }
    }

    if (isTarget) {
      const code = token.content;
      const ext = fenceOptions.ext || 'svg';
      const imgWidthStr = fenceOptions.width ? `width=${escape(fenceOptions.width)}` : '';
      const imgHeightStr = fenceOptions.height ? `height=${escape(fenceOptions.height)}` : '';

      try {
        // cacheディレクトリの作成
        if (!fs.existsSync('cache')) {
          fs.mkdirSync('cache');
        }

        const cacheName = calcCacheName({langName: langName, info: info, code: code}, ext);
        const cachePath = `cache/${cacheName}`;

        // キャッシュがある場合は処理を実行しない
        if (!fs.existsSync(cachePath)) {
          console.log(`${cachePath} is not exists. Creating it ...`);
          const output = renderFunctions[langName](code, fenceOptions);
          console.log(typeof (output));
          fs.writeFileSync(cachePath, output, 'utf-8');
        }
        else {
          console.log(`${cachePath} is already exists. Use this cache.`);
        }
        const tag = `<div><img src="../${cachePath}" ${imgWidthStr} ${imgHeightStr} /></div>`
        return tag;
      }
      catch (ex) {
        const escapedErrStr = escape(ex);
        const tag = `<div><pre>${escapedErrStr}</pre></div>`
        return tag;
      }
    }

    // デフォルトの処理を行う
    return defautFenceFunction(tokens, idx, options, env, slf);
  }
}


module.exports = myPlugin;
