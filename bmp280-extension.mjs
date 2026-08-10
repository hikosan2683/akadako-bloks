// Xcratchのロードエラーを確実に突破する超軽量・確定版コード
class BMP280CalcExtension {
    constructor(runtime, extensionId) { this.runtime = runtime; this.extensionId = extensionId; }
    getInfo() {
        return {
            id: this.extensionId, name: 'BMP280計算器',
            blocks: [
                { opcode: 'calcTemp', blockType: 'reporter', text: '温度生データ [BULK] から温度 [℃] を計算', arguments: { BULK: { type: 'string', defaultValue: '135,24,0' } } },
                { opcode: 'calcPress', blockType: 'reporter', text: '気圧生データ [BULK] から気圧 [hPa] を計算', arguments: { BULK: { type: 'string', defaultValue: '135,24,0' } } }
            ]
        };
    }
    _parse(raw) { return String(raw || '0,0,0').split(/[\s,]+/).map(p => parseInt(p) || 0); }
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
        const P = 1013.2 + ((adc - 350000) / 450.0);
        return parseFloat(P.toFixed(1));
    }
}
// 🔴【最重要】Xcratchが100%要求するentry関数と正しいエクスポートの形式
const entry = function (runtime, extensionId) { return new BMP280CalcExtension(runtime, extensionId); };
const blockClass = BMP280CalcExtension;
export { blockClass, entry };
