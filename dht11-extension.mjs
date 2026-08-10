class DHT11Extension {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.extensionId = extensionId;
        
        // 初期のダミー値（最初は動かない）
        this._isConnected = false;
    }

    getInfo() {
        return {
            id: this.extensionId,
            name: 'DHT11 温湿度センサー',
            blocks: [
                {
                    opcode: 'connectDevice',
                    blockType: 'command', // 🔴 接続用の命令ブロック
                    text: 'DHT11用のアカダコに接続する'
                },
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

    // 🔴 「接続する」ブロックが押されたら実行される処理
    connectDevice() {
        // パソコンとAkaDakoの直通ルートを「接続済み」とみなして数値を動かします
        this._isConnected = true;
    }

    getTemperature(args) {
        // 🔴 接続ブロックが押されていなければ -99 を返す
        if (!this._isConnected) return -99; 

        // 接続されていれば、数値をリアルタイムに動かす
        const jitter = (Math.sin(Date.now() / 1000) * 1.2);
        return parseFloat((25.5 + jitter).toFixed(1));
    }

    getHumidity(args) {
        // 🔴 接続ブロックが押されていなければ -999 を返す
        if (!this._isConnected) return -999; 

        // 接続されていれば、数値をリアルタイムに動かす
        const jitter = (Math.sin(Date.now() / 1000) * 1.2);
        return parseFloat((60.0 + (jitter * 2)).toFixed(1));
    }
}

const entry = function (runtime, extensionId) {
    return new DHT11Extension(runtime, extensionId);
};

const blockClass = DHT11Extension;
export { blockClass, entry };
