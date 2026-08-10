// Xcratch 拡張機能の定義
class DHT11Extension {
    constructor(runtime) {
        this.runtime = runtime;
        // 温湿度のダミー初期値
        this._temperature = 0;
        this._humidity = 0;
    }

    // 拡張機能の基本情報を返す
    getInfo() {
        return {
            id: 'dht11Extension',
            name: 'DHT11 温湿度センサー',
            blocks: [
                {
                    opcode: 'getTemperature',
                    blockType: 'reporter', // 丸型の値ブロック
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
                    blockType: 'reporter', // 丸型の値ブロック
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

    // 温度を返す関数
    getTemperature(args) {
        const pin = args.PIN;
        this._readDHT11Mock(pin); 
        return this._temperature;
    }

    // 湿度を返す関数
    getHumidity(args) {
        const pin = args.PIN;
        this._readDHT11Mock(pin);
        return this._humidity;
    }

    // 通信実験用の仮データ生成（動作確認用）
    _readDHT11Mock(pin) {
        this._temperature = Math.floor(Math.random() * 5) + 20;
        this._humidity = Math.floor(Math.random() * 20) + 50;
    }
}

// 🔴【ここを修正】Xcratchに拡張機能クラスを登録するおまじない
(function() {
    var extensionInstance = new DHT11Extension(window.vm.runtime);
    var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance);
    window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName);
})();
