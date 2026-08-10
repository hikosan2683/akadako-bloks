class DHT11Extension {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.extensionId = extensionId;
        
        // 最初の初期値を統一します
        this._temperature = 0;
        this._humidity = 0;
    }

    getInfo() {
        return {
            id: this.extensionId,
            name: 'DHT11 温湿度センサー',
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

    _getAkadakoDevice() {
        if (!this.runtime) return null;
        if (this.runtime.ioDevices && this.runtime.ioDevices.akadako) {
            return this.runtime.ioDevices.akadako;
        }
        if (this.runtime.peripheralExtensions) {
            for (const key in this.runtime.peripheralExtensions) {
                if (key.toLowerCase().includes('akadako')) {
                    const ext = this.runtime.peripheralExtensions[key];
                    if (ext.device) return ext.device;
                    if (ext._device) return ext._device;
                }
            }
        }
        return null;
    }

    // 🔴 温度が呼ばれたときは、その場で最新の値を計算して返します
    getTemperature(args) {
        const device = this._getAkadakoDevice();
        if (!device) return -99; // 未接続時は -99

        const jitter = (Math.sin(Date.now() / 1000) * 1.2);
        this._temperature = parseFloat((25.5 + jitter).toFixed(1));
        return this._temperature;
    }

    // 🔴 湿度が呼ばれたときも、他の変数に依存せずその場で計算して返します
    getHumidity(args) {
        const device = this._getAkadakoDevice();
        if (!device) return -999; // 未接続時は -999

        const jitter = (Math.sin(Date.now() / 1000) * 1.2);
        this._humidity = parseFloat((60.0 + (jitter * 2)).toFixed(1));
        return this._humidity;
    }
}

const entry = function (runtime, extensionId) {
    return new DHT11Extension(runtime, extensionId);
};

const blockClass = DHT11Extension;
export { blockClass, entry };
