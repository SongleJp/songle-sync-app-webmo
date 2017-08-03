# Songle Sync Webmo向けslaveプロジェクト

ビートにに合わせてWebmoのモータが回ります。

# 必要なもの

- [Webmo](http://webmo.io/)
- [Songle API のアクセストークン](http://tutorial.songle.jp/sync/step3#register-app)

## 使い方

アクセストークンを[settings.js](https://github.com/SongleJp/songle-sync-app-pi/blob/master/settings.js) に設定します。

WebmoのWiFiに接続した状態で、以下のようにして実行してください。 `npm install` は最初の一度だけ必要です。

```sh
$ git clone https://github.com/SongleJp/songle-sync-app-webmo
$ cd songle-sync-app-webmo
$ npm install
$ node webmo.js
```

## ビルド方法

`webmo.ts` はTypeScriptで書かれているので、 `tsc` コマンドを使ってビルドしてください。 `webmo.js` が上書きされます。

```sh
$ tsc
```

`tsc` がインストールされていない環境では、まず以下のようにしてインストールする必要があります。

```sh
$ npm install -g typescript
```
