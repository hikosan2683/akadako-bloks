const EXTENSION_ID = 'grove7seg';
const EXTENSION_NAME = '4桁7セグ表示器';

// 7セグ（TM1637）用の文字パターンデータ（0〜9）
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
                        PIN: { type: 'number', defaultValue: 5 }, // デジタルBはピン5
                        NUM: { type: 'number', defaultValue: 1234 }
                    }
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

    // 🔴 タイムラグを相殺するための非同期ウェイト関数
    _delayMs(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 🔴 1バイトの点灯データを同期を保ちながら送信する関数
    async _writeByte(device, clk, dio, byte) {
        for (let i = 0; i < 8; i++) {
            device.setDigitalOutput(clk, 0);
            device.setDigitalOutput(dio, (byte & 0x01));
            await this._delayMs(1); // 1ミリ秒の安定時間を確保
            device.setDigitalOutput(clk, 1);
            await this._delayMs(1);
            byte >>= 1;
        }
        // 応答信号(ACK)の空回し
        device.setDigitalOutput(clk, 0);
        await this._delayMs(1);
        device.setDigitalOutput(clk, 1);
        await this._delayMs(1);
        device.setDigitalOutput(clk, 0);
    }

    // 🔴 送信を開始する命令信号
    async _startSignal(device, clk, dio) {
        device.setDigitalOutput(clk, 1);
        device.setDigitalOutput(dio, 1);
        await this._delayMs(1);
        device.setDigitalOutput(dio, 0);
        await this._delayMs(1);
        device.setDigitalOutput(clk, 0);
    }

    // 🔴 送信を終了する命令信号
    async _stopSignal(device, clk, dio) {
        device.setDigitalOutput(clk, 0);
        device.setDigitalOutput(dio, 0);
        await this._delayMs(1);
        device.setDigitalOutput(clk, 1);
        await this._delayMs(1);
        device.setDigitalOutput(dio, 1);
    }

    // 🔴 数値を光らせるためのメインの実行処理（async化）
    async displayNumber(args) {
        if (!this._isConnected) return;
        
        const device = this._getAkadakoDevice();
        if (!device || !device.setDigitalOutput) return;

        // クロックはピン5（白）、データはピン6（黄）に割り振られます
        const clk = args.PIN; 
        const dio = args.PIN + 1; 

        // 4桁の数字を配列に分解
        let numStr = Math.floor(args.NUM).toString().padStart(4, ' ');
        let displayData = [];
        for (let i = 0; i < 4; i++) {
            let char = numStr[i];
            displayData.push(char === ' ' ? 0x00 : T_HEX[parseInt(char)]);
        }

        try {
            // 命令群を順番に確実に送り込みます
            await this._startSignal(device, clk, dio);
            await this._writeByte(device, clk, dio, 0x40); // 自動加算モード
            await this._stopSignal(device, clk, dio);

            await this._startSignal(device, clk, dio);
            await this._writeByte(device, clk, dio, 0xC0); // 最初の桁のアドレス
            for (let i = 0; i < 4; i++) {
                await this._writeByte(device, clk, dio, displayData[i]);
            }
            await this._stopSignal(device, clk, dio);

            await this._startSignal(device, clk, dio);
            await this._writeByte(device, clk, dio, 0x8F); // 輝度ON（最大）
            await this._stopSignal(device, clk, dio);

        } catch (error) {
            console.error("7セグ信号送信失敗:", error);
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
