const EXTENSION_ID = 'grove7seg';
const EXTENSION_NAME = '4桁7セグ表示器';

// 🔴 7セグ（TM1637）用の文字パターンデータ（0〜9）
const T_HEX = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f];

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
                        PIN: { type: 'number', defaultValue: 5 }, // デジタルBは5
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

    _getAkadakoDevice() {
        if (this.runtime && this.runtime.ioDevices && this.runtime.ioDevices.akadako) {
            return this.runtime.ioDevices.akadako;
        }
        return null;
    }

    connect7Seg() {
        this._isConnected = true;
    }

    // 🔴 100万分の1秒単位でピンをパタパタさせるためのウェイト関数
    _delay() {
        const start = performance.now();
        while (performance.now() - start < 0.05) {} // 約50マイクロ秒待つ
    }

    // 🔴 TM1637へ1バイトのデータを送信するコア通信ロジック
    _writeByte(device, clk, dio, byte) {
        for (let i = 0; i < 8; i++) {
            device.setDigitalOutput(clk, 0);
            this._delay();
            device.setDigitalOutput(dio, (byte & 0x01));
            this._delay();
            device.setDigitalOutput(clk, 1);
            this._delay();
            byte >>= 1;
        }
        // ACK（応答信号）の処理
        device.setDigitalOutput(clk, 0);
        this._delay();
        device.setDigitalOutput(clk, 1);
        this._delay();
        device.setDigitalOutput(clk, 0);
    }

    // 🔴 TM1637への通信開始命令
    _startSignal(device, clk, dio) {
        device.setDigitalOutput(clk, 1);
        device.setDigitalOutput(dio, 1);
        this._delay();
        device.setDigitalOutput(dio, 0);
        this._delay();
        device.setDigitalOutput(clk, 0);
    }

    // 🔴 TM1637への通信終了命令
    _stopSignal(device, clk, dio) {
        device.setDigitalOutput(clk, 0);
        device.setDigitalOutput(dio, 0);
        this._delay();
        device.setDigitalOutput(clk, 1);
        device.setDigitalOutput(dio, 1);
        this._delay();
    }

    // 🔴 実際の数字を光らせるメイン処理
    displayNumber(args) {
        if (!this._isConnected) return;
        
        const device = this._getAkadakoDevice();
        if (!device || !device.setDigitalOutput) return;

        // デジタルB（ピン5）の場合、CLK＝ピン5（白）、DIO＝ピン6（黄）になります
        const clk = args.PIN; 
        const dio = args.PIN + 1; 

        // 表示する4桁の数字をバラバラにして配列にする（例: 1234 -> [1, 2, 3, 4]）
        let numStr = Math.floor(args.NUM).toString().padStart(4, ' ');
        let displayData = [];
        for (let i = 0; i < 4; i++) {
            let char = numStr[i];
            displayData.push(char === ' ' ? 0x00 : T_HEX[parseInt(char)]);
        }

        try {
            // 手順1: データコマンド（自動アドレス加算モードを設定: 0x40）
            this._startSignal(device, clk, dio);
            this._writeByte(device, clk, dio, 0x40);
            this._stopSignal(device, clk, dio);

            // 手順2: アドレスコマンド（最初の桁 0xC0 から4桁分の文字データを連続送信）
            this._startSignal(device, clk, dio);
            this._writeByte(device, clk, dio, 0xC0);
            for (let i = 0; i < 4; i++) {
                this._writeByte(device, clk, dio, displayData[i]);
            }
            this._stopSignal(device, clk, dio);

            // 手順3: 輝度表示コントロールコマンド（画面をONにし、明るさを最大: 0x8F）
            this._startSignal(device, clk, dio);
            this._writeByte(device, clk, dio, 0x8F);
            this._stopSignal(device, clk, dio);

            console.log(`[7Seg] 「${numStr}」の点灯パルスを送信完了しました。`);

        } catch (error) {
            console.error("7セグ信号送信失敗:", error);
        }
    }

    clearDisplay(args) {
        if (!this._isConnected) return;
        const device = this._getAkadakoDevice();
        if (!device || !device.setDigitalOutput) return;
        const clk = args.PIN;
        const dio = args.PIN + 1;

        // 画面を消灯するコマンド (0x80)
        this._startSignal(device, clk, dio);
        this._writeByte(device, clk, dio, 0x80);
        this._stopSignal(device, clk, dio);
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
