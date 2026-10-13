import { PUBLIC_PATH } from "../../config.js";
import BaseModel from "./BaseModel.js";
import path from 'path';

const APRESENTACOES_SHEET_ID = process.env.APRESENTACOES_SHEET_ID;

class Apresentacao extends BaseModel {
    static OBJ_NAME = 'apresentacao';
    static LIST_NAME = 'apresentacoes';
    static FIELDS = [
        'titulo', 'texto', 'link_texto', 'link_url', 'foto'
    ];
    static DOWNLOAD = {
        name_field: 'titulo',
        img_field: 'foto',
        download_path: path.join(PUBLIC_PATH, 'assets', 'apresentacoes'),
        import_path: './assets/apresentacoes/'
    }

    constructor(object = {}) {
        super(object, Apresentacao.FIELDS);
    }

    static async fromSheet() {
        const response = await super.fromSheet(APRESENTACOES_SHEET_ID, ['Dados']);
        const list = super.fromRows(response[0].slice(2) || [], Apresentacao.FIELDS);
        return list.map((object) => new Apresentacao(object));
    }

    async downloadImage() {
        const hasImg = !!this[Apresentacao.DOWNLOAD.img_field];
        if (hasImg) await super.downloadImage(Apresentacao.DOWNLOAD);
        return this;
    }
}

export default Apresentacao;