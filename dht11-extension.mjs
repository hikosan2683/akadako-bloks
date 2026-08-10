const EXTENSION_ID = 'dht11extension';
const EXTENSION_NAME = 'DHT11 温湿度センサー';

class DHT11Extension {
    constructor(runtime) {
        this.runtime = runtime;
        this._temperature = 0;
        this._humidity = 0;
    }

    getInfo() {
        return {
            id: EXTENSION_ID,
            name: EXTENSION_NAME,
            blocks: [
                {
                    opcode: 'getTemperature',
                    blockType: 'reporter',
                    text: 'デジタル [PIN] 番ピンの温度 [℃]',
                    arguments: { PIN: { type: 'number', defaultValue: 4 } }
                },
                {
                    opcode: 'getHumidity',
                    blockType: 'reporter',
                    text: 'デジタル [PIN] 番ピンの湿度 [％]',
                    arguments: { PIN: { type: 'number', defaultValue: 4 } }
                }
            ]
        };
    }

    getTemperature(args) { return 25; } // 動作確認用の仮値
    getHumidity(args) { return 60; }    // 動作確認用の仮値

    // 🔴 静的プロパティを定義
    static get EXTENSION_ID() { return EXTENSION_ID; }
    static get EXTENSION_NAME() { return EXTENSION_NAME; }
}

// 🔴【最重要】同じクラスを両方の役割としてエクスポート
export { DHT11Extension as blockClass, DHT11Extension as entry };
