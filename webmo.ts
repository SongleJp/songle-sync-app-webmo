// ローカルホストのWebmoに接続
var WebmoWs = require("webmo-client-nodejs").ws;
var motor = new WebmoWs("webmo.local");
motor.onopen = onMotorConnected;
// motor.onmessage = (json) => console.log(json);

var Songle = require("songle-api");

// トークンの情報を取ってくる
var settings = require("./settings");

// Songle IoMT APIのエンドポイント指定
Songle.System.defaultEndpointWebClientProtocol = "https:";
Songle.System.defaultEndpointWebClientHost = "api.songle.jp";
Songle.System.defaultEndpointWebSocketProtocol = "https:";
Songle.System.defaultEndpointWebSocketHost = "api.songle.jp";
Songle.System.showLogMode = true;

// ビート情報と基本情報をもらってくる
var player = new Songle.Player({
    accessToken: settings.tokens.access
});
player.addPlugin(new Songle.Plugin.Beat());
// player.addPlugin(new Songle.Plugin.Chord());
// player.addPlugin(new Songle.Plugin.Melody());
player.addPlugin(new Songle.Plugin.Chorus());
player.addPlugin(new Songle.Plugin.SongleSync());

var initialized = false;
function onMotorConnected() {
    console.log("Webmo: connected");
    if (initialized) return;
    var isClockwise = false;

    // 何はともあれモーターを止める
    motor.stop();

    // 何かあったらコンソールに書き出す
    player.on("play", (ev) => console.log("play"));
    player.on("seek", (ev) => console.log("seek"));

    // 曲が止まったらモーターも止める
    player.on("pause", (ev) => {
        console.log("pause");
        motor.stop();
        isClockwise = false;
    });

    // 曲が止まったらモーターも止める
    player.on("finish", (ev) => {
        console.log("finish");
        motor.stop();
        isClockwise = false;
    });

    // 1ビート目に到達するたびにモーターの動作を反転する
    var inChorus = false;
    player.on("repeatSectionLeave", (ev) => {
        var index = parseInt(ev.data.section.index);
        if (index === 0) inChorus = false;
        console.log('chorus: leave, section index:', index);
    });
    player.on("repeatSectionEnter", (ev) => {
        var index = parseInt(ev.data.section.index);
        if (index === 0) inChorus = true;
        console.log('chorus: enter, section index:', index);
    });
    player.on("beatEnter", (ev) => {
        var position = ev.data.beat.position;
        console.log("beat:", position, ", chorus?:", inChorus);
        if (position === 1 || (inChorus && position === 3)) {
            if (isClockwise) {
                motor.rotate(360);
            } else {
                motor.rotate(-360);
            }
            isClockwise = !isClockwise;
        }
    });
    initialized = true;
}

process.on('SIGTERM', function() {
    if (!initialized) return;
    motor.stop();
});
