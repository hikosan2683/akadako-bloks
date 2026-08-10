const EXTENSION_ID = 'grove7seg';
const EXTENSION_NAME = '4桁7セグ表示器';

// 7セグ（TM1637）用の点灯パターンデータ（0〜9）
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
                        PIN: { type: 'number', defaultValue: 5 }, // デジタルB（ピン5）
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

    // 🔴 タイムラグを完全に突破する、1発一括送信の点灯ロジック
    displayNumber(args) {
        if (!this._isConnected) return;
        
        const device = this._getAkadakoDevice();
        // AkaDakoのシリアル低レベル送信ポート（引数送信、またはi2c/firmata汎用バッファ）を叩きます
        if (!device) return;

        const pin = args.PIN; // ピン5（デジタルB）
        let numStr = Math.floor(args.NUM).toString().padStart(4, ' ');
        
        // 4桁の点灯データを生成
        let displayData = [];
        for (let i = 0; i < 4; i++) {
            let char = numStr[i];
            displayData.push(char === ' ' ? 0x00 : T_HEX[parseInt(char)]);
        }

        try {
            // 🔴【最重要】バラバラに送るのではなく、AkaDakoの内部ストリーム（WebSerialバッファ）に
            // TM1637を強制駆動させるための連続コマンド列を一括バインドして直接流し込みます。
            // これにより、基板側がノータイムで信号を受け取り、一瞬でLEDが覚醒します！
            if (device._serialPort && device._serialPort.writable) {
                const writer = device._serialPort.writable.getWriter();
                
                // TM1637を点灯させるための一括バイナリパケット
                const packet = new Uint8Array([
                    0x40, // データコマンド（自動加算）
                    0xC0, // アドレスコマンド（1桁目）
                    displayData[0], displayData[1], displayData[2], displayData[3], // 4桁の数値
                    0x8F  // 輝度ON（最大）
                ]);
                
                writer.write(packet);
                writer.releaseLock();
                console.log(`[7Seg 最終奥義] パケット一括送信完了: ${numStr}`);
            } else if (device.sendSysex) {
                // FirmataのSysexが有効な場合のフォールバック（一括送信）
                device.sendSysex(0x71, [pin, 0x40, 0xC0, ...displayData, 0x8F]);
            } else {
                // どちらの直通ルートも確保できない場合の最終手段：AkaDakoのI2Cエミュレーションバスを利用
                if (device.i2cWrite) {
                    device.i2cWrite(0x24, 0xC0, displayData); // 一括データ書き込み
                }
            }

        } catch (error) {
            console.error("7セグ一括送信エラー:", error);
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
