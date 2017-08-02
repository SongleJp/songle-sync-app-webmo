# Songle Sync Webmo向けslaveプロジェクト

## Webmoに名前をつけてパスワードを設定する

1. `configure_edison --name`
2. `configure_edison --password`

これで名前解決で迷わず、Wi-Fi経由のSSHが許可されるようになります。

## wifi-manager でWi-Fiアクセスポイントに接続する方法

1. `./webmo/wifi-manager/bin/enableSTA` を編集してWi-Fiアクセスポイントの情報を入力します
2. `chmod 755 ./webmo/wifi-manager/bin/enableSTA` で実行できるようにします
3. `./webmo/wifi-manager/bin/enableSTA` を実行します

これで、以降は設定したWi-Fiアクセスポイントが使われるようになります。

## wifi-manager で静的IPを設定する方法

1. `{ "ip": "IPアドレス", "gateway": "デフォルトゲートウェイ", "netmask": "ネットマスク" }` という内容のファイルを `./webmo/wifi-manager/options.json` として保存します
2. `./webmo/wifi-manager/index.js` のメイン処理 `// communicate with other process via zmq` より前に以下のコードを追加します

これで、ブート時にIPアドレスが設定されるようになります。

```javascript
// set static IP begin
var exec = require('child-process-promise').exec
var FS = require('q-io/fs')
var options = require('./options')
if (options.ip) {
  console.log('set IP address to ' + options.ip)

  var setIP = exec('ifconfig wlan0 ' + options.ip + ' netmask ' + (options.netmask ? options.netmask : '255.255.255.0'))
  .then(function () {
    return exec('route add default gw ' + options.gateway)
  })
  .then(function () {
    console.log('done setting ip address')
  })
  .catch(function (e) {
    console.log('fail setting ip address')
    console.log(e)
  });

  FS.read('/var/run/udhcpc-wlan0.pid')
  .then(function (content) {
    console.log('killing udhcpc PID: ' + content)
    return exec('kill ' + content)
  })
  .then(function () {
    return exec('rm /var/run/udhcpc-wlan0.pid')
  })
  .then(setIP, setIP);
}
// -- set static IP end
```

## 一般的な使い方説明

`grunt` コマンドを使ってビルドしてください。

```sh
$ npm install
$ grunt
```

 `grunt` がインストールされていない環境では、まず以下のようにしてインストールする必要があります。

```sh
$ npm install -g grunt

```
以下のようにして実行してください。

```sh
$ node webmo.js
```

なお、現状のコードはWebmoのなかで実行されることを前提にしており、 `127.0.0.1` でWebmoにアクセスできる場合に正しく動作します。必要に応じてコード上のIPアドレスを書き換えてください。例えばUSB経由でRNDISによって接続されている場合は `192.168.2.15` に変更します。
