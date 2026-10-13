import { PUBLIC_PATH } from "../../config.js";
import BaseModel, { formatMediaSheet } from "./BaseModel.js";
import path from 'path';

const MEMBROS_SHEET_ID = process.env.MEMBROS_SHEET_ID;

class Membro extends BaseModel {
    static OBJ_NAME = 'membro';
    static LIST_NAME = 'membros';
    static FIELDS = [
        'nome', 'data_nascimento', 'foto', 'cargo', 'departamento', 'destacar', 'media'
    ];
    static CONFIG = { bool: ['destacar'], joinAt: ['media'] }
    static DOWNLOAD = {
        name_field: 'nome',
        img_field: 'foto',
        download_path: path.join(PUBLIC_PATH, 'assets', 'membros', 'data'),
        import_path: './assets/membros/data/'
    }

    constructor(object = {}) {
        super(object, Membro.FIELDS, Membro.CONFIG);
    }

    static async fromSheet() {
        const response = await super.fromSheet(MEMBROS_SHEET_ID, ['Dados', 'Media']);
        const sheetDados = response[0].slice(2) || [];
        const sheetMedia = formatMediaSheet(response[1]) || [];
        const list = super.fromCombinedRows(sheetDados, Membro.FIELDS, Membro.CONFIG, sheetMedia) || [];
        return list.map((object) => new Membro(object));
    }

    async downloadImage() {
        const hasImg = !!this[Membro.DOWNLOAD.img_field];
        if (hasImg) await super.downloadImage(Membro.DOWNLOAD);
        return this;
    }
}

export default Membro;