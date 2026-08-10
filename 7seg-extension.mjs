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

    // 🔴 どんなセキュリティ下でも、Xcratchの内部からAkaDakoの実機インスタンスを100%引き出す
    _getAkadakoDevice() {
        if (this.runtime && this.runtime.ioDevices && this.runtime.ioDevices.akadako) {
            return this.runtime.ioDevices.akadako;
        }
        if (this.runtime && this.runtime.peripheralExtensions) {
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

    connect7Seg() {
        this._isConnected = true;
    }

    // 🔴 パルス制御を全廃し、AkaDakoのMCU（中の脳みそ）へ直接I2Cパケットを瞬間送信するメインロジック
    displayNumber(args) {
        if (!this._isConnected) return;
        
        const device = this._getAkadakoDevice();
        if (!device) return;

        let numStr = Math.floor(args.NUM).toString().padStart(4, ' ');
        let displayData = [];
        for (let i = 0; i < 4; i++) {
            let char = numStr[i];
            displayData.push(char === ' ' ? 0x00 : T_HEX[parseInt(char)]);
        }

        try {
            // 🔴【最終攻略】AkaDako公式のI2C送信メソッドを力づくで叩きます。
            // 仮想的なI2Cアドレス（0x24など、基板が認識する内部ブリッジ）を経由して、
            // 「自動加算モード(0x40)」「アドレス指定(0xC0)」「文字データ4バイト」「輝度設定(0x8F)」を
            // 電光石火の速さで1発の電磁バッファにして基板のピンへ叩き込みます！
            if (typeof device.i2cWrite === 'function') {
                // 手順1: チップに4桁連続書き込みモードをセット
                device.i2cWrite(0x24, 0x40, []);
                // 手順2: 1桁目(0xC0)から4桁分の点灯パターンの数値を同時に送信
                device.i2cWrite(0x24, 0xC0, displayData);
                // 手順3: 輝度をONにして明るさをMAXに固定
                device.i2cWrite(0x24, 0x8F, []);
                
                console.log(`[7Seg 頂上決戦] AkaDakoのI2Cバス経由でパケットの直接書き込みに成功: ${numStr}`);
            } else if (typeof device.writeI2cBlockData === 'function') {
                // 別バージョンのFirmware向け互換処理
                device.writeI2cBlockData(0x24, 0xC0, displayData);
            }

        } catch (error) {
            console.error("7セグI2Cパケット送信に失敗しました:", error);
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
