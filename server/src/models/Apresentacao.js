import BaseModel from "./BaseModel.js";

const APRESENTACOES_SHEET_ID = process.env.APRESENTACOES_SHEET_ID;

class Apresentacao extends BaseModel {
    static OBJ_NAME = 'apresentacao';
    static LIST_NAME = 'apresentacoes';
    static FIELDS = [
        'titulo', 'texto', 'link_texto', 'link_url', 'foto'
    ];

    constructor(object = {}) {
        super(object, Apresentacao.FIELDS);
    }

    static async fromSheet() {
        const response = await super.fromSheet(APRESENTACOES_SHEET_ID, ['Dados']);
        return super.fromRows(response[0].slice(2) || [], Apresentacao.FIELDS);
    }

}

export default Apresentacao;