const EXTENSION_ID = 'groveairquality';
const EXTENSION_NAME = 'VOC空気質センサー';

class GroveAirQualityExtension {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.extensionId = extensionId;
        
        // 直通接続の状態フラグ
        this._isConnected = false;
        this._airQualityLevel = 0;
    }

    getInfo() {
        return {
            id: this.extensionId,
            name: EXTENSION_NAME,
            blocks: [
                {
                    opcode: 'connectAirSensor',
                    blockType: 'command', // 四角い接続ブロック
                    text: '空気質センサーの接続を有効にする'
                },
                {
                    opcode: 'getAirQuality',
                    blockType: 'reporter', // 丸型の値ブロック
                    text: 'デジタル [PIN] 番ピンの空気の汚れ度 [0-10]',
                    arguments: {
                        PIN: {
                            type: 'number',
                            defaultValue: 4 // デジタルA（ピン4）を標準値に
                        }
                    }
                }
            ]
        };
    }

    // 🔴 どんな環境からでもAkaDakoの実機オブジェクトを100%引き出す関数
    _getAkadakoDevice() {
        if (this.runtime && this.runtime.ioDevices && this.runtime.ioDevices.akadako) {
            return this.runtime.ioDevices.akadako;
        }
        if (this.runtime && this.runtime.peripheralExtensions) {
            for (const key in this.runtime.peripheralExtensions) {
                if (key.toLowerCase().includes('akadako')) {
                    const ext = this.runtime.peripheralExtensions[key];
                    if (ext.device) return ext.device;
                }
            }
        }
        return null;
    }

    connectAirSensor() {
        // 直通ルートを開くスイッチ
        this._isConnected = true;
    }

    // 🔴 1秒間のウェイトを安全に処理するためのタイマー関数
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 🔴 自作ブロックが押されたら、裏側で1秒間（10回）ハイスピードでピンの状態をチェックするメイン処理
    async getAirQuality(args) {
        // 接続ブロックが事前に押されていなければ予備データの -99 を返す
        if (!this._isConnected) return -99;

        const device = this._getAkadakoDevice();
        if (!device) return 0; // 実機が見つからない場合は 0

        const pin = args.PIN; // 指定されたピン番号（デジタルAは4）
        let onCount = 0;

        try {
            // JavaScriptのasync/awaitを駆使して、裏側で正確に0.1秒ごとに10回監視を繰り返します
            for (let i = 0; i < 10; i++) {
                // AkaDako公式のデジタル入力関数を安全に呼び出します
                const pinState = typeof device.getDigitalInput === 'function' ? device.getDigitalInput(pin) : 0;
                
                if (pinState === 1) {
                    onCount++; // 信号が1（ON）だったらカウントを増やす
                }
                await this._sleep(100); // 0.1秒（100ミリ秒）一時停止して次のチェックへ
            }

            // 1秒間の測定が終わったら、カウントされた数値（0〜10）を変数に格納
            this._airQualityLevel = onCount;

        } catch (error) {
            console.error("空気質データの測定に失敗:", error);
            return -88;
        }

        return this._airQualityLevel;
    }
}

class entry {
    constructor(runtime, extensionId) {
        return new GroveAirQualityExtension(runtime, extensionId);
    }
    static get EXTENSION_ID() { return EXTENSION_ID; }
    static get EXTENSION_NAME() { return EXTENSION_NAME; }
}

export { GroveAirQualityExtension as blockClass, entry };
