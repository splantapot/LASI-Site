import Apresentacao from "../models/Apresentacao.js";
import Membro from "../models/Membro.js";
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

APP_DATA[Membro.LIST_NAME] = [
    new Membro({
        nome: "Ana Silva",
        data_nascimento: "15/04/1998",
        foto: "./assets/membros/data/ana_silva.png",
        cargo: "Diretora de Projetos",
        departamento: "Engenharia",
        destacar: "sim", // O BaseModel vai converter automaticamente para true usando o validateBool
        media: {
            linkedin: "https://linkedin.com",
            github: "https://github.com"
        }
    }),
    new Membro({
        nome: "Carlos Santos",
        data_nascimento: "22/09/1995",
        foto: "./assets/membros/data/carlos_santos.png",
        cargo: "Desenvolvedor Fullstack",
        departamento: "Tecnologia da Informação",
        destacar: "não", // Será convertido para false pelo BaseModel
        media: {
            github: "https://github.com",
            instagram: "https://instagram.com"
        }
    }),
    new Membro({
        nome: "Beatriz Oliveira",
        data_nascimento: "03/11/2000",
        foto: "./assets/membros/data/beatriz_oliveira.png",
        cargo: "Designer UI/UX",
        departamento: "Marketing & Design",
        destacar: "true", // Também aceito pelo seu validador booleano
        media: {
            behance: "https://behance.net",
            linkedin: "https://linkedin.com"
        }
    }),
    new Membro({
        nome: "Lucas Almeida",
        data_nascimento: "30/01/1997",
        foto: "./assets/membros/data/lucas_almeida.png",
        cargo: "Consultor Técnico",
        departamento: "Consultoria",
        destacar: "0", // Será convertido para false
        media: {
            linkedin: "https://linkedin.com"
        }
    })
];

// Seletivos -> Seletivos
APP_DATA[Seletivo.LIST_NAME] = [

]

export default APP_DATA;