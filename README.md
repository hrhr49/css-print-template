# CSS組版のテンプレ

自分用のドキュメント作成環境を作成するためのリポジトリです。
いい感じのPDFを作る環境を作るのが目標です。

## 使用したもの

* [markdown-it](https://github.com/markdown-it/markdown-it) : markdownからhtmlへの変換
* [vivliostyle](https://github.com/vivliostyle/vivliostyle) : CSS組版によって出力PDFのレイアウトなど調整

## 必要なもの

* Node.js
* Python(ブックマーク生成スクリプトに使用)

## 使い方

1. パッケージのインストール

1-1. npmパッケージ
```
npm install
```
または

```
yarn
```

1-2. pipパッケージ

```
pip install pipenv # pipenvが入っていない場合
```

```
pipenv install
```


2. ビルド

```
yarn build
```

また、以下のコマンドでscssファイルとhtmlファイルを監視して自動でビルドする。
(index.htmlからpdfが生成される)

```
yarn watch
```



## 参考

* [CSSではじめる同人誌制作 増訂版](https://booth.pm/ja/items/969754)
* [Vivliostyle CSS組版ちょっと入門サンプル](https://gist.github.com/MurakamiShinyu/4f0423fd3578a277c7d29f56a31912b7/)
* [CSS 組版やってみた！](https://vivliostyle.github.io/vivliostyle_doc/ja/vivliostyle-user-group-vol1/yamasy/index.html)

## 注意点

* h1~h6タグで同じ名称の項目があると、目次内でのページ数がおかしくなる。
これはid属性によって紐付けを行っているため。

## TODO

* ファイルの分割
* PDFでのブックマーク自動生成
* ディレクトリ構成やスクリプトの整理
