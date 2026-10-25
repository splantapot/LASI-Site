// Default modules
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';

import { get_template } from './path/templates.js';
import { copyPublicTemplate, deletePublic, getHtmlPath } from './path/public.js';
import Apresentacao from './models/Apresentacao.js';
import Membro from './models/Membro.js';
import Patrocinador from './models/Patrocinador.js';
import Projeto from './models/Projeto.js';

function createHtml(filename = null, data = null) {
    if (!filename || !data) return;

    const ejs_name = `${filename}.ejs`;
    const html_name = `${filename}.html`;

    const template = get_template(ejs_name);
    const html_data = ejs.render(template, data);

    const output_path = getHtmlPath(html_name);
    fs.writeFileSync(output_path, html_data);
}

async function buildWebsite() {
    console.log("\n=== Starting Website building ===\n");
    deletePublic();
    copyPublicTemplate();

    // ===== Processing data ==================================================

    // Apresentações
    const apList = await Apresentacao.fromSheet();
    const apresentacoes = [];
    for (const ap of apList) {
        await ap.downloadImage();
        apresentacoes.push(ap);
    }
    console.log('> Apresentações ok');

    // Membros
    const membrosList = await Membro.fromSheet();
    const membros = [];
    for (const membro of membrosList) {
        await membro.downloadImage();
        membros.push(membro);
    }
    console.log('> Membros ok');

    // Patrocinadores
    const patrList = await Patrocinador.fromSheet();
    const patrocinadores = [];
    for (const p of patrList) {
        await p.downloadImage();
        patrocinadores.push(p);
    }
    console.log('> Patrocinadores ok')

    // Projetos
    const projetosList = await Projeto.fromSheet();
    const projetos = [];
    for (const p of projetosList) {
        await p.downloadImage();
        projetos.push(p);
    }
    console.log('> Projetos ok')

    const APP_DATA = {
        apresentacoes: apresentacoes,
        membros: membros,
        patrocinadores: patrocinadores,
        projetos: projetos,
    }

    // Render site ============================================================

    createHtml('index', APP_DATA);
    createHtml('projetos', APP_DATA);
    createHtml('membros', APP_DATA);

    // Done!

    console.log('\n=== Site rendered successfully!');
}

export { buildWebsite };
export default buildWebsite;