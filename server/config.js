// FILE TO EXPORT DEFAULT SETTINGS

// USES DOTENV
import dotenv from "dotenv";
dotenv.config();

// imports
import path from 'path';
const __dirname = import.meta.dirname;

// ========================================================
// BUILD CONSTANTS
// ========================================================
const PUBLIC_PATH = path.join(__dirname, '..', 'public');

const VIEWS_PATH = path.join(__dirname, '..', 'views');
const TMP_PATH = path.join(VIEWS_PATH, 'templates');
const ASSETS_PATH = path.join(VIEWS_PATH, 'assets');
const NEWS_PATH = path.join(VIEWS_PATH, 'noticias');
const CSS_PATH = path.join(VIEWS_PATH, 'css');
const JS_PATH = path.join(VIEWS_PATH, 'js');

// exports
export { PUBLIC_PATH, VIEWS_PATH, TMP_PATH, ASSETS_PATH, NEWS_PATH, CSS_PATH, JS_PATH};

// ========================================================
// WEB CONSTANTS
// ========================================================

const WEB_REQUEST_TIMEOUT = 60000;      // Download data for up to 60 seconds, otherwise throw an error.
const WEB_REQUEST_LIMIT = 200;          // Max quantity of requests per minute

export { WEB_REQUEST_TIMEOUT, WEB_REQUEST_LIMIT };
