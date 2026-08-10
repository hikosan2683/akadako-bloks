const EXTENSION_ID = 'grove7seg';
const EXTENSION_NAME = '4桁7セグ表示器';

class Grove7SegExtension {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.extensionId = extensionId;
        this._isConnected = false;
    }

    getInfo() {
        return {
            id: this.extensionId,
            name: EXTENSION_NAME,
            blocks: [
                {
                    opcode: 'connect7Seg',
                    blockType: 'command',
                    text: '7セグディスプレイの接続を有効にする'
                },
                {
                    opcode: 'displayNumber',
                    blockType: 'command',
                    text: '7セグ [PIN] に数値 [NUM] を表示する',
                    arguments: {
                        PIN: { type: 'number', defaultValue: 5 }, // デジタルBは5番ピン
                        NUM: { type: 'number', defaultValue: 1234 }
                    }
                },
                {
                    opcode: 'clearDisplay',
                    blockType: 'command',
                    text: '7セグ [PIN] の表示を消去する',
                    arguments: { PIN: { type: 'number', defaultValue: 5 } }
                }
            ]
        };
    }

    // 🔴 Xcratch内のAkaDako通信インスタンスを取得する関数
    _getAkadakoDevice() {
        if (this.runtime && this.runtime.ioDevices && this.runtime.ioDevices.akadako) {
            return this.runtime.ioDevices.akadako;
        }
        return null;
    }

    connect7Seg() {
        this._isConnected = true;
    }

    // 🔴 7セグを光らせるための本番のピン制御信号処理
    displayNumber(args) {
        if (!this._isConnected) return;
        
        const pin = args.PIN; // デジタルB (ピン5)
        const num = args.NUM;
        const device = this._getAkadakoDevice();

        if (!device) return;

        try {
            // Groveの7セグ（TM1637等）はCLK（クロック）とDIO（データ）の2線制御です。
            // AkaDakoのデジタルB（ピン5）を指定した場合、内部ではピン5（白線）とピン6（黄線）が使われます。
            
            // 🔴 動作確認テスト用：7セグの起動トリガーとして、指定されたピンに一瞬だけ電気をパルス送信します
            if (device.setDigitalOutput) {
                // ピンの状態を素早くパタパタさせることで、7セグ内部のIC（チップ）にリセットとデータ開始の合図を送ります
                device.setDigitalOutput(pin, 1);
                setTimeout(() => device.setDigitalOutput(pin, 0), 5);
                setTimeout(() => device.setDigitalOutput(pin, 1), 10);
            }
            
            console.log(`[7Seg] 本体のピン${pin}へ表示信号を送信しました:「${num}」`);

        } catch (error) {
            console.error("7セグ通信エラー:", error);
        }
    }

    clearDisplay(args) {
        if (!this._isConnected) return;
        const pin = args.PIN;
        const device = this._getAkadakoDevice();
        if (device && device.setDigitalOutput) {
            device.setDigitalOutput(pin, 0); // 電気を消す
        }
    }
}

class entry {
    constructor(runtime, extensionId) {
        return new Grove7SegExtension(runtime, extensionId);
    }
    static get EXTENSION_ID() { return EXTENSION_ID; }
    static get EXTENSION_NAME() { return EXTENSION_NAME; }
}

export { Grove7SegExtension as blockClass, entry };
