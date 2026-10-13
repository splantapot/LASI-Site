import BaseModel from "./BaseModel.js";

const SELETIVOS_SHEET_ID = process.env.SELETIVOS_SHEET_ID;

class Seletivo extends BaseModel {
    static OBJ_NAME = 'seletivo';
    static LIST_NAME = 'seletivos';
    static FIELDS = [
        'titulo', 'data_inicio', 'data_fim', 'link_edital', 'link_resultado'
    ];

    constructor(object = {}) {
        super(object, Seletivo.FIELDS);
    }

    static async fromSheet() {
        const response = await super.fromSheet(SELETIVOS_SHEET_ID, ['Dados']);
        const list = super.fromRows(response[0].slice(2) || [], Seletivo.FIELDS);
        return list.map((sel) => new Seletivo(sel));
    }

}

export default Seletivo;