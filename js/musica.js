/* ===== Player de música (YouTube) no canto =====
   Edite só o bloco MUSICA abaixo.
   - link:   endereço do vídeo no YouTube (ex.: https://www.youtube.com/watch?v=XXXXXXXXXXX).
             Deixe "" para mostrar "Música em breve".
   - titulo: nome que aparece embaixo do vídeo.
   - inicio / fim: trecho que toca, em SEGUNDOS. Ex.: inicio: 45, fim: 105 toca de 0:45 a 1:45.
             Use fim: 0 para ir até o final do vídeo. */
const MUSICA = {
  link: "https://www.youtube.com/watch?v=M5DDeKCSJek&list=RDM5DDeKCSJek&start_radio=1",
  titulo: "TENDAS",
  inicio: 0,
  fim: 0
};

(function () {
  const $ = id => document.getElementById(id);
  const vid = (MUSICA.link.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/) || [])[1];
  const card = $("plCard"), prog = $("plProg"), vol = $("plVol"), play = $("plPlay");
  let yt = null, pronto = false;

  $("plTitulo").textContent = MUSICA.titulo;
  if (vid) $("plLink").href = "https://www.spotify.com/" + vid;
  else { card.classList.add("sem-musica"); $("plLink").hidden = true; prog.disabled = vol.disabled = true; }

  const fmt = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const pintar = (el, p) => el.style.setProperty("--p", p + "%");
  const duracao = () => Math.max(1, (MUSICA.fim || yt.getDuration() || 1) - MUSICA.inicio);
  pintar(vol, vol.value);

  function atualizar() {
    if (!pronto) return;
    const dur = duracao();
    const t = Math.min(Math.max(yt.getCurrentTime() - MUSICA.inicio, 0), dur);
    prog.value = t / dur * 1000; pintar(prog, t / dur * 100);
    $("plAtual").textContent = fmt(t); $("plResta").textContent = "-" + fmt(dur - t);
  }

  function criar() {
    const v = { controls: 0, disablekb: 1, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, fs: 0, start: MUSICA.inicio };
    if (MUSICA.fim) v.end = MUSICA.fim;
    yt = new YT.Player("plAlvo", { videoId: vid, playerVars: v, events: {
      onReady: () => { pronto = true; yt.setVolume(+vol.value); atualizar(); },
      onStateChange: e => {
        play.classList.toggle("tocando", e.data === 1);
        if (e.data === 0) { yt.seekTo(MUSICA.inicio, true); yt.pauseVideo(); }   // acabou: volta ao começo
      }
    }});
    setInterval(atualizar, 250);
  }

  function carregarAPI() {
    if (yt || !vid) return;
    if (window.YT && YT.Player) return criar();
    window.onYouTubeIframeAPIReady = criar;
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s);
  }

  // abrir e fechar (o vídeo continua tocando com o painel fechado)
  const alternar = abrir => {
    const aberto = card.classList.toggle("aberto", abrir);
    $("plBtn").setAttribute("aria-expanded", aberto);
    if (aberto) carregarAPI();
  };
  $("plBtn").addEventListener("click", () => alternar());
  $("plFechar").addEventListener("click", () => alternar(false));

  // controles
  play.addEventListener("click", () => pronto && (yt.getPlayerState() === 1 ? yt.pauseVideo() : yt.playVideo()));
  const pular = d => {
    if (!pronto) return;
    const max = MUSICA.fim || yt.getDuration();
    yt.seekTo(Math.min(max - 1, Math.max(MUSICA.inicio, yt.getCurrentTime() + d)), true);
  };
  $("plVolta").addEventListener("click", () => pular(-10));
  $("plAvanca").addEventListener("click", () => pular(10));
  prog.addEventListener("input", () => { if (pronto) { yt.seekTo(MUSICA.inicio + prog.value / 1000 * duracao(), true); pintar(prog, prog.value / 10); } });
  vol.addEventListener("input", () => { pintar(vol, vol.value); pronto && yt.setVolume(+vol.value); });
})();