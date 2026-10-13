// Default modules
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';

import { get_template } from './path/templates.js';
import { copyPublicTemplate, deletePublic } from './path/public.js';
import Apresentacao from './models/Apresentacao.js';

function createHtml(filename = null, data = null) {
    if (!filename || !data) return;

    const ejs_name = `${filename}.ejs`;
    const html_name = `${filename}.html`;

    const template = get_template(ejs_name);
    const html_data = ejs.render(template, data);

    const output_path = get_html_path(html_name);
    fs.writeFileSync(output_path, html_data);
}

function downloadPng(filename = null, property = null, url = null) {
    if (!filename || !property || !data) return;


}

async function buildWebsite(data) {
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

    // Render site ============================================================

    console.log('== Site rendered successfully!');
}

export { buildWebsite };
export default buildWebsite;