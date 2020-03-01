# CSS組版のテンプレ

## 必要なもの

* Node.js
* Python(ブックマーク生成スクリプトに使用)

## 使い方

1. パッケージのインストール

```
npm install
```

または

```
yarn
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


## 使用したもの

* [vivliostyle](https://vivliostyle.org/ja/)

## 参考

* [CSSではじめる同人誌制作 増訂版](https://booth.pm/ja/items/969754)
* [Vivliostyle CSS組版ちょっと入門サンプル](https://gist.github.com/MurakamiShinyu/4f0423fd3578a277c7d29f56a31912b7/)

## 注意点

* h1~h6タグで同じ名称の項目があると、目次内でのページ数がおかしくなる。
これはid属性によって紐付けを行っているため。

## TODO

* フォントの設定
* 目次の自動生成
* ファイルの分割
* Markdown対応
