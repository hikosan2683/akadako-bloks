// 新規：4桁7セグメントディスプレイ専用のブロック定義
const EXTENSION_ID = 'grove7seg';
const EXTENSION_NAME = '4桁7セグ表示器';

class Grove7SegExtension {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.extensionId = extensionId;
        
        // 接続状態を管理するフラグ
        this._isConnected = false;
    }

    getInfo() {
        return {
            id: this.extensionId,
            name: EXTENSION_NAME,
            blocks: [
                {
                    opcode: 'connect7Seg',
                    blockType: 'command', // 接続用ブロック
                    text: '7セグディスプレイの接続を有効にする'
                },
                {
                    opcode: 'displayNumber',
                    blockType: 'command', // 数値を表示するブロック
                    text: '7セグ [PIN] に数値 [NUM] を表示する',
                    arguments: {
                        PIN: {
                            type: 'number',
                            defaultValue: 5 // デジタルB（ピン5）を標準に
                        },
                        NUM: {
                            type: 'number',
                            defaultValue: 1234
                        }
                    }
                },
                {
                    opcode: 'clearDisplay',
                    blockType: 'command', // 画面を消去するブロック
                    text: '7セグ [PIN] の表示を消去する',
                    arguments: {
                        PIN: {
                            type: 'number',
                            defaultValue: 5
                        }
                    }
                }
            ]
        };
    }

    // 「有効にする」ブロックの処理
    connect7Seg() {
        this._isConnected = true;
    }

    // 「数値を表示する」ブロックの処理
    displayNumber(args) {
        if (!this._isConnected) return;
        
        const pin = args.PIN;
        const num = args.NUM;
        
        // 内部処理: 本来はここでAkaDakoのピンを制御してTM1637（4桁7セグIC）へ信号を送ります
        console.log(`[7Seg] ピン${pin} の4桁ディスプレイに「${num}」を表示しました。`);
    }

    // 「表示を消去する」ブロックの処理
    clearDisplay(args) {
        if (!this._isConnected) return;
        
        const pin = args.PIN;
        console.log(`[7Seg] ピン${pin} の表示をクリアしました。`);
    }
}

// XcratchのIDミスマッチを防ぐためのEntryクラス定義
class entry {
    constructor(runtime, extensionId) {
        return new Grove7SegExtension(runtime, extensionId);
    }
    static get EXTENSION_ID() { return EXTENSION_ID; }
    static get EXTENSION_NAME() { return EXTENSION_NAME; }
}

export { Grove7SegExtension as blockClass, entry };
