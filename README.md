# Site de evangelização · ACAMPs 2027
Comunidade Católica Shalom de Santos

## Como abrir
Dê dois cliques em `index.html`. Não precisa instalar nada.

## Onde alterar
- `js/mensagens.js`: lista de versículos (copie uma linha para adicionar). Confira o texto com a tradução da Bíblia que vocês usam.
- `index.html`: texto da tela inicial e o botão "Mais Informações" (`id="infoEvento"`; troque o `href="#"` pelo link oficial). Aqui também ficam o nome da comunidade e o link do Instagram.
- `css/style.css`: cores e fontes (no começo, em `:root`) e todo o visual.
- `js/fundo.js`: ajustes do efeito do fundo (objeto `FUNDO`: tamanho da célula, contraste, cintilação, fps).
- `js/fundo-imagem.js`: foto do fundo. Para trocar, converta outra imagem pequena (uns 340px de largura) para base64 e substitua o valor de `FUNDO_IMG`.
- `img/fundo-original.webp`: foto original, guardada só para referência.

## Como colocar no ar (grátis)
Qualquer um serve, pois o site é estático (só HTML, CSS e JS):
- **Netlify Drop** (app.netlify.com/drop): arraste a pasta inteira para a página.
- **Vercel**, **Cloudflare Pages** ou **GitHub Pages**: envie os arquivos do projeto.
Mantenha a estrutura de pastas como está.

