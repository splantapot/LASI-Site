import Apresentacao from "../models/Apresentacao.js";
import Patrocinador from "../models/Patrocinador.js";
import Projeto from "../models/Projeto.js";
import Seletivo from "../models/Seletivo.js";

// module with fake dev app data

const APP_DATA = {};

// Index -> Apresentacoes
APP_DATA[Apresentacao.LIST_NAME] = [
    new Apresentacao({
        titulo: "First",
        texto: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas et tellus sed ipsum aliquet suscipit a at mi. Suspendisse lacus felis, consectetur in arcu non, elementum elementum odio. Nullam dictum risus nibh, et sodales nibh varius id. Nam tempor, tortor et sagittis porta, orci purus cursus ligula, ut ullamcorper risus nulla in tellus. Morbi maximus massa suscipit, scelerisque nisl in, tincidunt elit.",
        link_texto: "Conheça-nos",
        link_url: "#about",
        foto: "./assets/blank-slideshow.png"
    }).toJson(),
    new Apresentacao({
        titulo: "Second",
        foto: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200"
    }).toJson(),
    new Apresentacao({
        titulo: "Third",
        link_texto: "Leia mais",
        link_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200"
    }).toJson(),
    new Apresentacao({
        titulo: "Fourth"
    }).toJson()
];

// Index -> Patrocinadores
APP_DATA[Patrocinador.LIST_NAME] = [
    new Patrocinador({
        nome: "Tornado Fibra",
        logo: "./assets/patrocinadores/tornado-fibra.png",
        link: "https://www.tornadonet.com.br/",
        formato: "Retangular"
    }).toJson()
];

// Projetos -> Projetos
APP_DATA[Projeto.LIST_NAME] = [
    new Projeto({
        titulo: 'Projeto A',
        data: "17 abs 2026",
        media: {email: "https://mail.google.com/", instagram:"https://instagram.com/lasi.ufpi", github:"https://github.com/LASI-UFPI", youtube:"https://youtube.com/@lasi-4908"},
        img1: './assets/info/logomarca-lasi.png',
        texto: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Maecenas et tellus sed ipsum aliquet suscipit a at mi.
            Suspendisse lacus felis, consectetur in arcu non, elementum elementum odio.
            Nullam dictum risus nibh, et sodales nibh varius id.
            Nullam dictum risus nibh, et sodales nibh varius id.
            Nullam dictum risus nibh, et sodales nibh varius id.
            Nullam dictum risus nibh, et sodales nibh varius id.
            Nullam dictum risus nibh, et sodales nibh varius id.
            Nullam dictum risus nibh, et sodales nibh varius id.
            Nam tempor, tortor et sagittis porta, orci purus cursus ligula, ut ullamcorper risus nulla in tellus. Morbi maximus massa suscipit, scelerisque nisl in, tincidunt elit.`
    }).toJson()
];

APP_DATA[Memb]

// Seletivos -> Seletivos
APP_DATA[Seletivo.LIST_NAME] = [

]

export default APP_DATA;