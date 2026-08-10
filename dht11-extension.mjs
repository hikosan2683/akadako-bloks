// 拡張機能の一識別子と名前を定義
const EXTENSION_ID = 'dht11Extension';
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

    static get EXTENSION_ID() { return EXTENSION_ID; }
    static get EXTENSION_NAME() { return EXTENSION_NAME; }
}

// 🔴【重要】Xcratchが必要とする entry オブジェクトの定義
const entry = function (runtime) {
    return new DHT11Extension(runtime);
};

// blockClass と entry の両方を必ずエクスポートする
export { DHT11Extension as blockClass, entry };
