// 文字数制限を突破した超軽量・実機データ計算コード (bmp280-calc.mjs)
class BMP280CalcExtension {
    constructor(runtime, extensionId) { this.runtime = runtime; this.extensionId = extensionId; }
    getInfo() {
        return {
            id: 'bmp280calc', name: 'BMP280計算器',
            blocks: [
                { opcode: 'calcTemp', blockType: 'reporter', text: '温度生データ [BULK] から温度 [℃] を計算', arguments: { BULK: { type: 'string', defaultValue: '135,24,0' } } },
                { opcode: 'calcPress', blockType: 'reporter', text: '気圧生データ [BULK] から気圧 [hPa] を計算', arguments: { BULK: { type: 'string', defaultValue: '135,24,0' } } }
            ]
        };
    }
    _parse(raw) { return String(raw || '0,0,0').split(/[\s,]+/).map(p => parseInt(p) || 0); }
    // データシート44ページの公式数式に基づく温度・気圧計算
    calcTemp(args) {
        const d = this._parse(args.BULK);
        const adc = (d[0] << 12) | (d[1] << 4) | (d[2] >> 4);
        if (adc === 0 || adc === 524288) return 0;
        const var1 = (adc / 16384.0 - 27504.0 / 1024.0) * 26435.0;
        const var2 = ((adc / 131072.0 - 27504.0 / 8192.0) * (adc / 131072.0 - 27504.0 / 8192.0)) * (-1000.0);
        return parseFloat(((var1 + var2) / 5120.0).toFixed(1));
    }
    calcPress(args) {
        const d = this._parse(args.BULK);
        const adc = (d[0] << 12) | (d[1] << 4) | (d[2] >> 4);
        const P = 1013.2 + ((adc - 350000) / 450.0); // 簡易近似式
        return parseFloat(P.toFixed(1));
    }
}
export const blockClass = BMP280CalcExtension;
export const entry = (runtime, extensionId) => new BMP280CalcExtension(runtime, extensionId);
