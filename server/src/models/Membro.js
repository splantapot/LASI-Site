import BaseModel, { formatMediaSheet } from "./BaseModel.js";

const MEMBROS_SHEET_ID = process.env.MEMBROS_SHEET_ID;

class Membro extends BaseModel {
    static OBJ_NAME = 'membro';
    static LIST_NAME = 'membros';
    static FIELDS = [
        'nome', 'data_nascimento', 'foto', 'cargo', 'departamento', 'destacar', 'media'
    ];
    static CONFIG = { bool: ['destacar'], joinAt: ['media'] }

    constructor(object = {}) {
        super(object, Membro.FIELDS, Membro.CONFIG);
    }

    static async fromSheet() {
        const response = await super.fromSheet(MEMBROS_SHEET_ID, ['Dados', 'Media']);
        const sheetDados = response[0].slice(2) || [];
        const sheetMedia = formatMediaSheet(response[1]) || [];
        return super.fromCombinedRows(sheetDados, Membro.FIELDS, Membro.CONFIG, sheetMedia) || [];
    }
}

export default Membro;