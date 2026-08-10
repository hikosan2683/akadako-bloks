// 1. 拡張機能のIDを固定値で定義（すべて小文字・英数字のみが安全です）
const EXTENSION_ID = 'dht11extension';

class DHT11Extension {
    constructor(runtime) {
        this.runtime = runtime;
        this._temperature = 0;
        this._humidity = 0;
    }

    getInfo() {
        return {
            id: EXTENSION_ID, // 2. getInfoが返すID
            name: 'DHT11 温湿度センサー',
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

    // 3. クラス自体にIDを返すゲッターを持たせる（Xcratchのチェック対策）
    static get EXTENSION_ID() {
        return EXTENSION_ID;
    }
}

// 4. entry関数を定義
const entry = function (runtime) {
    return new DHT11Extension(runtime);
};

// 5. 🔴【最重要】entry関数自体にもIDプロパティを持たせる（これで entry: 'undefined' が解消されます）
entry.EXTENSION_ID = EXTENSION_ID;

// Xcratchの仕様に合わせてエクスポート
export { DHT11Extension as blockClass, entry };
