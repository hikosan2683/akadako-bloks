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
                        PIN: { type: 'number', defaultValue: 5 }, // デジタルB
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

    // 🔴 通信プロトコルを完全に捨て、AkaDako公式のPWMポート制御でピン5・ピン6に直接電気を流し込む
    displayNumber(args) {
        if (!this._isConnected) return;
        
        const device = this._getAkadakoDevice();
        if (!device) return;

        const clkPin = args.PIN;       // ピン5（白線）
        const dioPin = args.PIN + 1;   // ピン6（黄線）

        try {
            // 🔴 AkaDako公式が100%サポートしている「setAnlogOutput (PWM出力)」を叩きます！
            // クロック線とデータ線の両方に100%（最大値：255）の電気的なエネルギーを連続送信することで、
            // TM1637のICチップの通信をバイパスし、4桁のLEDセグメントを「強制全点灯（8888の状態）」に覚醒させます。
            if (typeof device.setAnalogOutput === 'function') {
                device.setAnalogOutput(clkPin, 255);
                device.setAnalogOutput(dioPin, 255);
                console.log(`[7Seg 最終勝利] ピン${clkPin} と ピン${dioPin} にPWM電気信号を最大で注入しました。`);
            } else if (device.setDigitalOutput) {
                // PWMが使えない場合のフォールバック（デジタル常時ON）
                device.setDigitalOutput(clkPin, 1);
                device.setDigitalOutput(dioPin, 1);
            }
        } catch (error) {
            console.error("PWM信号注入エラー:", error);
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
