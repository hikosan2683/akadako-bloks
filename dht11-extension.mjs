// Xcratchのシステムから要求される正しいクラス定義
class DHT11Extension {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        
        // 🔴 Xcratchが内部で自動生成する固有のIDをそのまま代入します
        this.extensionId = extensionId; 
    }

    getInfo() {
        return {
            id: this.extensionId, // 🔴 固定文字ではなく、渡されたIDをそのまま返すのが必須
            name: 'DHT11 温湿度センサー',
            blockIconURI: '', 
            blocks: [
                {
                    opcode: 'getTemperature',
                    blockType: 'reporter',
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
                    blockType: 'reporter',
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

    getTemperature(args) {
        return 25; // テスト用の固定値
    }

    getHumidity(args) {
        return 60; // テスト用の固定値
    }
}

// 🔴【最重要】Xcratchが「拡張機能選択画面」に表示するために読み込むエントリ関数
const entry = function (runtime, extensionId) {
    return new DHT11Extension(runtime, extensionId);
};

// 🔴【最重要】Xcratchのローダー（gui.js）が100%要求するエクスポートの正しい組み合わせ
const blockClass = DHT11Extension;
export { blockClass, entry };
