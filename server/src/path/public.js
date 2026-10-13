import fs from 'fs';
import path from 'path';

import { ASSETS_PATH, CSS_PATH, JS_PATH, PUBLIC_PATH } from './../../config.js';

function deletePublic() {
    console.log('>> Deleting "public" folder...');
    if (fs.existsSync(PUBLIC_PATH)) {
        fs.rmSync(PUBLIC_PATH, { recursive: true });
        console.log('Done!');
    }
}

function createInAssets(folder_name = null) {
    console.log(`>> Creates "public/assets/${folder_name}" folder...`);
    const new_path = path.join(ASSETS_PATH, folder_name);
    if (!fs.existsSync(new_path)) {
        fs.mkdirSync(new_path, { recursive: true });
        console.log('Done!');
    }
    return new_path;
}

function copyFolder(src_path, out_path) {
    if (fs.existsSync(src_path)) {
        fs.cpSync(src_path, out_path, { recursive: true, force: true });
    } else {
        console.warn(`Warning: Folder not found at ${src_path}`);
    }
}

function copyPublicTemplate() {
    console.log('>> Copying "views" folder as template to "public"...');
    copyFolder(ASSETS_PATH, path.join(PUBLIC_PATH, 'assets'));
    copyFolder(CSS_PATH, path.join(PUBLIC_PATH, 'css'));
    copyFolder(JS_PATH, path.join(PUBLIC_PATH, 'js'));
    console.log('Done!');
}

function getHtmlPath(filename) {
    const full_path = path.join(PUBLIC_PATH, filename);
    if (!fs.existsSync(path.dirname(full_path))) {
        fs.mkdirSync(path.dirname(full_path), { recursive: true });
    }
    return full_path;
}

export {
    deletePublic, copyFolder,
    createInAssets,
    copyPublicTemplate,
    getHtmlPath
}