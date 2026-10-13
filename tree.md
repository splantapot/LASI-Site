LASI-SITE/

    apps-scripts/
    ...

    dev/
    ...

    server/

    shared/

    views/


MODELS AND USES:
Todo modelo se baseia em "BaseModel"

__index
*Apresentacao        ['titulo', 'texto', 'link_texto', 'link_url', 'foto']
*Patrocinador        ['nome', 'logo', 'link', 'formato da logo':[rect, circle, square]]

__projetos
*Projeto             ['titulo', 'data', 'texto', 'miniatura', 'media', 'fotos'] + [planilha_das_medias]

__membros   
*Membro              ['nome', 'data_nascimento', 'foto', 'cargo', 'departamento', 'destacar', 'media'] + [medias]

__seletivos
*Seletivo            ['titulo', 'data_inicio', 'data_fim', 'link_edital', 'link_resultado']

__noticias           
 Noticia             [... a definir] ['titulo', 'editor', 'data_publicacao', 'data_revisao', 'documento']

__quizes
 Quiz                [... a definir]

__acervo             [... a definir]
