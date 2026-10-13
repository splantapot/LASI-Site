// Opening Express APP (for deving)
import express from 'express';
const app = express();
const APP_PORT = 8080;

// Import another modules
import { VIEWS_PATH, TMP_PATH, ASSETS_PATH, NEWS_PATH, CSS_PATH, JS_PATH } from './config.js';

import APP_DATA from './src/dev/data.js';
const BUILD_DATA = APP_DATA;

// Set the view engine as EJS
app.set('view engine', 'ejs');

// Serve public static files
app.set('views', TMP_PATH);
app.use('/assets', express.static(ASSETS_PATH));
app.use('/noticias', express.static(NEWS_PATH));
app.use('/css', express.static(CSS_PATH));
app.use('/js', express.static(JS_PATH));

// ========================================================
// Routing
// ========================================================

app.get('/', (req, res) => {
    res.render('index', BUILD_DATA);
});

app.get('/demo', (req, res) => {
    res.render('index-demo');
});

app.get('/projetos', (req, res) => {
    res.render('projetos');
});

app.get('/membros', (req, res) => {
    res.render('membros');
});

app.get('/seletivos', (req, res) => {
    res.render('seletivos');
});

app.get('/noticias', (req, res) => {
    res.render('noticias');
});

app.get('/acervo', (req, res) => {
    res.render('acervo');
});

app.get('/quizes', (req, res) => {
    res.render('quizes');
});

app.listen(APP_PORT);
console.log('Development app running! Available in:');
console.log(`http://localhost:${APP_PORT}/`);