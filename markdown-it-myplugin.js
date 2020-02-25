/* 各種ダイアグラムなどを埋め込むプラグイン */
/* 特にキャッシュなどは行わないので遅い */
const execSync = require('child_process').execSync;

let myPlugin = (md, options) => {
  // もともとのフェンスレンダリング処理を取得(thisキーワードへの対策のためbindを使用する)
  const defautFenceFunction = md.renderer.rules.fence.bind(md.renderer.rules);

  md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';
  let langName = '';

    if (info) {
      langName = info.split(/\s+/g)[0];
    }

    const code = token.content;
    let command = '';

    // コードブロックの言語がdotならimgタグを作成して返す
    switch ( langName ) {
      case 'dot':
        command = 'dot -Tpng';
        break;
      case 'ditaa':
        command = 'ditaa -';
        break;
      case 'plantuml':
        command = 'plantuml -tpng -pipe';
        break;
      // case 'mermaid':
      //   command = 'npx mmdc -i tmp/input.mmd  -o tmp/output.png';
        //   break;
      default:
        break;
    }

    if ( command )
    {
      // コマンドを実行してbase64形式にしてimgタグに入れる
      const output = execSync(command, {input: code});
      const b64 = output.toString('base64');
      const tag = `<img src="data:image/png;base64,${b64}" />`
      return tag;
    }

    if ( langName === 'mermaid' )
    {
      return `<div class="mermaid">${code}</div>`;
    }

    // デフォルトの処理を行う
    return defautFenceFunction (tokens, idx, options, env, slf);
  }
};

module.exports = myPlugin;
