class DHT11Extension {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        // 🔴【修正】Xcratchが割り当てたIDをそのまま使用する
        this.extensionId = extensionId; 
        
        this._temperature = 0;
        this._humidity = 0;
    }

    getInfo() {
        return {
            // 🔴【修正】固定文字列ではなく、Xcratchから渡されたIDを入れる
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

// 🔴【修正】Xcratchローダーから渡されるextensionIdをコンストラクタに引き渡すentry関数
const entry = function (runtime, extensionId) {
    return new DHT11Extension(runtime, extensionId);
};

export { DHT11Extension as blockClass, entry };
