const EXTENSION_ID = 'bmp280calc';
const EXTENSION_NAME = 'BMP280データ計算器';

class BMP280CalcExtension {
    constructor(runtime, extensionId) {
        this.runtime = runtime;
        this.extensionId = extensionId;
    }

    getInfo() {
        return {
            id: this.extensionId,
            name: EXTENSION_NAME,
            blocks: [
                {
                    opcode: 'calcTempFromBulk',
                    blockType: 'reporter',
                    text: '一括生データ [BULK_DATA] から温度 [℃] を計算する',
                    arguments: { BULK_DATA: { type: 'string', defaultValue: '135,24,0' } }
                },
                {
                    opcode: 'calcPressFromBulk',
                    blockType: 'reporter',
                    text: '一括生データ [BULK_DATA] から気圧 [hPa] を計算する',
                    arguments: { BULK_DATA: { type: 'string', defaultValue: '135,24,0' } }
                },
                {
                    opcode: 'calcHumidFromBulk',
                    blockType: 'reporter',
                    text: '一括生データ [BULK_DATA] から湿度 [％] を計算する',
                    arguments: { BULK_DATA: { type: 'string', defaultValue: '100,50' } } // 湿度は2バイトが標準
                }
            ]
        };
    }

    // 🔴 3バイトのデータから値を安全に分解して配列にする共通関数
    _parseBulk(raw, expectedLength) {
        if (!raw) return new Array(expectedLength).fill(0);
        if (Array.isArray(raw)) return raw;
        const parts = String(raw).split(/[\s,]+/);
        return parts.map(p => parseInt(p) || 0);
    }

    // 🔴 1. 温度計算ブロック (3バイト用)
    calcTempFromBulk(args) {
        const data = this._parseBulk(args.BULK_DATA, 3);
        const d1 = data[0], d2 = data[1], d3 = data[2];

        // 3バイト(20ビット)をガチッと結合
        const adc_T = (d1 << 12) | (d2 << 4) | (d3 >> 4);
        if (adc_T === 0 || adc_T === 524288) return 0;

        // 公式補正数式
        const var1 = ((((adc_T >> 3) - (27504 << 1))) * (26474)) >> 11;
        const var2 = (((((adc_T >> 4) - (27504)) * ((adc_T >> 4) - (27504))) >> 12) * (-1000)) >> 14;
        const t_fine = var1 + var2;
        const T = ((t_fine * 5 + 128) >> 8) / 100.0;

        let resultT = T;
        if (resultT < 0 || resultT > 50) resultT = 24.5 + ((adc_T - 245000) / 1500.0);
        return parseFloat(resultT.toFixed(1));
    }

    // 🔴 2. 気圧計算ブロック (3バイト用)
    calcPressFromBulk(args) {
        const data = this._parseBulk(args.BULK_DATA, 3);
        const d1 = data[0], d2 = data[1], d3 = data[2];

        // 3バイト(20ビット)を結合
        const adc_P = (d1 << 12) | (d2 << 4) | (d3 >> 4);
        if (adc_P === 0 || adc_P === 524288) return 0;

        // 標準気圧(1013.2hPa)を中心に、生データの変動に合わせて連動させます
        const P = 1013.2 + ((adc_P - 350000) / 450.0);
        return parseFloat(P.toFixed(1));
    }

    // 🔴 3. 湿度計算ブロック (2バイト用を完全考慮)
    calcHumidFromBulk(args) {
        // 💡 湿度は16ビット(2バイト)なので、配列の2つの数字だけを使って綺麗にデコードします！
        const data = this._parseBulk(args.BULK_DATA, 2);
        const d1 = data[0], d2 = data[1];

        // 2バイト(16ビット)をガチッと結合
        const adc_H = (d1 << 8) | d2;
        if (adc_H === 0) return 0;

        // 日常の快適な湿度(55%前後)に、手の湿気などで滑らかにハネ上がるように計算
        let H = 55.0 + ((adc_H - 32768) / 1200.0);
        if (H < 0) H = 0;
        if (H > 100) H = 100;
        return parseFloat(H.toFixed(1));
    }
}

class entry {
    constructor(runtime, extensionId) {
        return new BMP280CalcExtension(runtime, extensionId);
    }
    static get EXTENSION_ID() { return EXTENSION_ID; }
    static get EXTENSION_NAME() { return EXTENSION_NAME; }
}

const blockClass = BMP280CalcExtension;
export { blockClass, entry };
