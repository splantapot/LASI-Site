import { PUBLIC_PATH } from "../../config.js";
import BaseModel, { formatMediaSheet } from "./BaseModel.js";
import path from "path";

const PROJETOS_SHEET_ID = process.env.PROJETOS_SHEET_ID;
const MAX_PROJETOS_IMGS = 5;
const IMGS_FIELDS = Array.from({length: MAX_PROJETOS_IMGS}, (_, i) => `img${i+1}`);

class Projeto extends BaseModel {
    static OBJ_NAME = 'projeto';
    static LIST_NAME = 'projetos';
    static FIELDS = [
        'titulo', 'data', 'texto', 'media', ...IMGS_FIELDS
    ];

    static CONFIG = {
        joinAt: ['media']
    };

    static DOWNLOAD = {
        name_field: 'titulo',
        img_field: undefined,
        id: undefined,
        download_path: path.join(PUBLIC_PATH, 'assets', 'projetos', 'data'),
        import_path: './assets/projetos/data/'
    }

    constructor(object = {}) {
        super(object, Projeto.FIELDS, Projeto.CONFIG);
    };

    static async fromSheet() {
        const response = await super.fromSheet(PROJETOS_SHEET_ID, ['Dados', 'Mídia']);
        const sheetDados = response[0].slice(2)             || [];
        const sheetMedia = formatMediaSheet(response[1])    || [];
        return super.fromCombinedRows(sheetDados, Projeto.FIELDS, Projeto.CONFIG, sheetMedia);
    }

    async downloadImage() {
        for (let i = 0; i < IMGS_FIELDS.length; i++) {
            const field = IMGS_FIELDS[i];
            const DOWNLOAD = {...Projeto.DOWNLOAD}
            DOWNLOAD['img_field'] = field;
            DOWNLOAD['id'] = i + 1;
            const hasImg = !!this[field];
            if (hasImg) await super.downloadImage(DOWNLOAD);
        }
        return this;
    }
}

export default Projeto;