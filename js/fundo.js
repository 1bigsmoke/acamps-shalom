/* ===== Fundo "Electric Gaze" (dither + cintilação) em Canvas2D =====
   A imagem está em js/fundo-imagem.js (const FUNDO_IMG).
   No celular (tela em pé) a foto é encaixada inteira, com células menores,
   e as bordas se dissolvem no dourado do fundo para não aparecer corte seco. */
const FUNDO = {
  ativo: false,
  cell: 9,               // tamanho da célula no computador (px)
  cellMobile: 6,         // tamanho da célula no celular (menor = mais detalhe)
  zoomMobile: 1.3,       // 1 = foto inteira na largura; maior = mais perto do rosto
  posYMobile: 0.4,       // posição vertical da foto no celular (0 = topo, 1 = base)
  contrast: 1.58,
  dotSize: 0.8,
  shimmerIntensity: 0.6,
  shimmerSpeed: 1.0,
  fps: 24
};

(function () {
  const cv = document.getElementById("fundo"), ctx = cv.getContext("2d");
  if (!FUNDO.ativo) {cv.style.dysplay = "nome"; return; }
  const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v => (v + .5) / 16);
  const PALETA = Array.from({length: 125}, (_, k) =>
    "rgb(" + [Math.floor(k / 25), Math.floor(k / 5) % 5, k % 5].map(q => Math.round(q * 63.75)).join(",") + ")");
  const img = new Image();
  let cols, rows, cell, lum, rnd, cor, W, H, ultimoQuadro = 0;
  const parado = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function preparar() {
    const mobile = innerWidth < 700 && innerHeight > innerWidth;
    cell = mobile ? FUNDO.cellMobile : FUNDO.cell;
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);

    // posição e tamanho da foto, em células
    let k, dx, dy;
    if (mobile) {
      k = cols / img.width * FUNDO.zoomMobile;
      dx = (cols - img.width * k) / 2;
      dy = rows * FUNDO.posYMobile - img.height * k / 2;
    } else {
      k = Math.max(cols / img.width, rows / img.height);   // "cover"
      dx = (cols - img.width * k) / 2;
      dy = (rows - img.height * k) * 0.25;
    }
    const w = img.width * k, h = img.height * k;

    const o = document.createElement("canvas"); o.width = cols; o.height = rows;
    const x = o.getContext("2d");
    x.imageSmoothingQuality = "high";

    // 1) base: dourado médio da própria foto (amostra de uma área lisa)
    const a = document.createElement("canvas"); a.width = a.height = 1;
    a.getContext("2d").drawImage(img, 10, 30, 40, 40, 0, 0, 1, 1);
    const g = a.getContext("2d").getImageData(0, 0, 1, 1).data;
    x.fillStyle = "rgb(" + g[0] + "," + g[1] + "," + g[2] + ")";
    x.fillRect(0, 0, cols, rows);

    // 2) foto por cima; no celular as bordas de cima e de baixo se dissolvem
    const L = document.createElement("canvas"); L.width = cols; L.height = rows;
    const lx = L.getContext("2d");
    lx.imageSmoothingQuality = "high";
    lx.drawImage(img, dx, dy, w, h);
    if (mobile) {
      lx.globalCompositeOperation = "destination-in";
      const f = lx.createLinearGradient(0, dy, 0, dy + h);
      f.addColorStop(0, "rgba(0,0,0,0)"); f.addColorStop(.1, "rgba(0,0,0,1)");
      f.addColorStop(.8, "rgba(0,0,0,1)"); f.addColorStop(1, "rgba(0,0,0,0)");
      lx.fillStyle = f; lx.fillRect(0, 0, cols, rows);
    }
    x.drawImage(L, 0, 0);

    // 3) lê cada pixel (= uma célula): luminosidade e cor
    const d = x.getImageData(0, 0, cols, rows).data;
    lum = new Float32Array(cols * rows); rnd = new Float32Array(cols * rows); cor = new Uint8Array(cols * rows);
    const q = v => Math.min(4, Math.round(v / 63.75));
    for (let i = 0; i < cols * rows; i++) {
      const l = (0.299 * d[i*4] + 0.587 * d[i*4+1] + 0.114 * d[i*4+2]) / 255;
      lum[i] = Math.min(1, Math.max(0, (l - .5) * FUNDO.contrast + .5));
      rnd[i] = Math.random() * 6.283;
      cor[i] = q(d[i*4]) * 25 + q(d[i*4+1]) * 5 + q(d[i*4+2]);
    }
    desenhar(performance.now());
  }

  function desenhar(agora) {
    const t = agora / 1000 * FUNDO.shimmerSpeed, s = cell * FUNDO.dotSize, off = (cell - s) / 2;
    const P = new Array(125);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const n = j * cols + i;
      const v = lum[n] + Math.sin(t * 2.2 + rnd[n] + i * 0.18 + j * 0.11) * 0.25 * FUNDO.shimmerIntensity;
      if (v <= BAYER[(j & 3) * 4 + (i & 3)]) continue;     // dither ordenado (Bayer 4x4)
      (P[cor[n]] || (P[cor[n]] = new Path2D())).rect(i * cell + off, j * cell + off, s, s);
    }
    ctx.clearRect(0, 0, W, H);
    P.forEach((p, k) => { ctx.fillStyle = PALETA[k]; ctx.fill(p); });
  }

  function loop(agora) {
    if (agora - ultimoQuadro > 1000 / FUNDO.fps) { ultimoQuadro = agora; desenhar(agora); }
    requestAnimationFrame(loop);
  }
  img.onload = () => { preparar(); if (!parado) requestAnimationFrame(loop); };
  img.src = FUNDO_IMG;
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => img.complete && preparar(), 150); });
})();
