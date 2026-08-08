import BaseModel from "./BaseModel.js";

const PATROCINADORES_SHEET_ID = process.env.PATROCINADORES_SHEET_ID;

class Patrocinador extends BaseModel {
    static OBJ_NAME = 'patrocinador';
    static LIST_NAME = 'patrocinadores';
    static FIELDS = [
        'nome', 'logo', 'link', 'formato'
    ];

    constructor(object = {}) {
        super(object, Patrocinador.FIELDS);
        this.padronizeSize();
    }

    padronizeSize() {
        const current = this.formato.toLowerCase().replaceAll(' ', '');
        if (current.includes('ret'))
            this.formato = 'rect';
        else if (current.includes('cir')) 
            this.formato = 'circle';
        else 
            this.formato = 'square';
    }

    static async fromSheet() {
        const response = await super.fromSheet(PATROCINADORES_SHEET_ID, ['Dados']);
        return super.fromCombinedRows(response[0].slice(2) || [], Patrocinador.FIELDS);
    }
}

export default Patrocinador;