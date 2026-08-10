// dht11-extension.mjs の確定版コード
const EXTENSION_ID = 'dht11extension';
const EXTENSION_NAME = 'DHT11 温湿度センサー';

// 🔴【最重要】Xcratchのローダーが照合に使用する「クラス側の静的ゲッター」群
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
                    arguments: {
                        PIN: {
                            type: 'number',
                            defaultValue: 4
                        }
                    }
                },
                {
                    opcode: 'getHumidity',
                    blockType: 'reporter',
                    text: 'デジタル [PIN] 番ピンの湿度 [％]',
                    arguments: {
                        PIN: {
                            type: 'number',
                            defaultValue: 4
                        }
                    }
                }
            ]
        };
    }

    getTemperature(args) {
        this._readDHT11Mock(args.PIN); 
        return this._temperature;
    }

    getHumidity(args) {
        this._readDHT11Mock(args.PIN);
        return this._humidity;
    }

    _readDHT11Mock(pin) {
        this._temperature = Math.floor(Math.random() * 5) + 20;
        this._humidity = Math.floor(Math.random() * 20) + 50;
    }
}

// 🔴【最重要】Xcratchの仕様に準拠したEntryクラス
class entry {
    constructor(runtime) {
        return new DHT11Extension(runtime);
    }
    // エントリーポイントにID情報を静的ゲッターとして持たせる
    static get EXTENSION_ID() { return EXTENSION_ID; }
    static get EXTENSION_NAME() { return EXTENSION_NAME; }
}

// Xcratchのモジュールインターフェースに従ってエクスポート
export { DHT11Extension as blockClass, entry };
