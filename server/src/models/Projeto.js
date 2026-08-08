import BaseModel, { formatMediaSheet } from "./BaseModel.js";

const PROJETOS_SHEET_ID = process.env.PROJETOS_SHEET_ID;
const MAX_PROJETOS_IMGS = 5;

class Projeto extends BaseModel {
    static OBJ_NAME = 'projeto';
    static LIST_NAME = 'projetos';
    static FIELDS = [
        'titulo', 'data', 'texto', 'miniatura', 'media', ...Array.from({length: MAX_PROJETOS_IMGS}, (_, i) => `img${i+1}`)
    ];

    static CONFIG = {
        joinAt: ['media']
    };

    constructor(object = {}) {
        super(object, Projeto.FIELDS, Projeto.CONFIG);
    };

    static async fromSheet() {
        const response = await super.fromSheet(PROJETOS_SHEET_ID, ['Dados', 'Media']);
        const sheetDados = response[0].slice(2)             || [];
        const sheetMedia = formatMediaSheet(response[1])    || [];
        return super.fromCombinedRows(sheetDados, Projeto.FIELDS, Projeto.CONFIG, sheetMedia);
    }
}

export default Projeto;