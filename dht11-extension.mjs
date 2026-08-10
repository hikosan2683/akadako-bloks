class DHT11Extension {
    // 🔴 1. Xcratchから渡される「本物のID」を、第2引数ではなく第1引数（オプションオブジェクト）から安全に抽出します
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        
        // extensionId が undefined だった場合の安全な自動フォールバックを設定
        this.extensionId = extensionId || 'dht11Extension';
        
        this._temperature = 0;
        this._humidity = 0;
    }

    getInfo() {
        return {
            // 🔴 2. 割り当てられた本物のIDをここに100%一致させます
            id: this.extensionId, 
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
}

// 🔴 3. Xcratchローダーが実行する関数。第2引数としてIDを確実に引き渡します
const entry = function (runtime, extensionId) {
    return new DHT11Extension(runtime, extensionId);
};

// blockClassの名前を明示してエクスポート
export { DHT11Extension as blockClass, entry };
