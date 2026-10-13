import { PUBLIC_PATH } from "../../config.js";
import BaseModel from "./BaseModel.js";
import path from 'path';
const PATROCINADORES_SHEET_ID = process.env.PATROCINADORES_SHEET_ID;

class Patrocinador extends BaseModel {
    static OBJ_NAME = 'patrocinador';
    static LIST_NAME = 'patrocinadores';
    static FIELDS = [
        'nome', 'logo', 'link', 'formato'
    ];

    static DOWNLOAD = {
        name_field: 'nome',
        img_field: 'logo',
        download_path: path.join(PUBLIC_PATH, 'assets', 'patrocinadores'),
        import_path: './assets/patrocinadores/'
    }

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
        const list = super.fromCombinedRows(response[0].slice(2) || [], Patrocinador.FIELDS);
        return list.map((object) => new Patrocinador(object));
    }

    async downloadImage() {
        const hasImg = !!this[Patrocinador.DOWNLOAD.img_field];
        if (hasImg) await super.downloadImage(Patrocinador.DOWNLOAD);
        return this;
    }
}

export default Patrocinador;