// Xcratch 拡張機能の定義
class DHT11Extension {
    constructor(runtime) {
        this.runtime = runtime;
        // 温湿度のダミー初期値（AkaDakoとのシリアル通信から取得した値をここに格納する）
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
        // TODO: ここでAkaDakoのWebSerial経由でピンからデータを取得する処理を呼ぶ
        // 現状はポーリング不可避のため、定期実行されるバックグラウンド処理から
        // 最新のキャッシュ値を返すように実装するのが現実的です。
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
        // 本来はAkaDakoの通信インスタンスを叩く
        // 例: const akadako = this.runtime.ioDevices.akadako; 
        // 現時点では、簡易的に20〜25度のランダム値を返します
        this._temperature = Math.floor(Math.random() * 5) + 20;
        this._humidity = Math.floor(Math.random() * 20) + 50;
    }
}

// Xcratchにモジュールとしてエクスポート
export default DHT11Extension;
