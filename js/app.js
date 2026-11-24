const $ = id => document.getElementById(id);
const telas = {inicio:$("inicio"), mensagem:$("mensagem")};
let ultimo = -1;

function mostrar(nome){
  Object.entries(telas).forEach(([k,el]) => el.classList.toggle("ativa", k===nome));
  window.scrollTo({top:0, behavior:"smooth"});
}

function sortear(){
  let i;
  do { i = Math.floor(Math.random()*MENSAGENS.length); } while (MENSAGENS.length>1 && i===ultimo);
  ultimo = i;
  const m = MENSAGENS[i];
  $("versiculo").textContent = m.v;
  $("ref").textContent = m.r;
  $("frase").textContent = m.f;
  const c = $("cartao");
  c.classList.remove("troca"); void c.offsetWidth; c.classList.add("troca");
}

$("btnReceber").addEventListener("click", () => { sortear(); mostrar("mensagem"); });
$("btnOutra").addEventListener("click", sortear);
$("btnVoltar").addEventListener("click", () => mostrar("inicio"));

/* Compartilhar (aparece só em aparelhos compatíveis) */
if (navigator.share) {
  const b = $("btnCompartilhar"); b.hidden = false;
  b.addEventListener("click", () => {
    const m = MENSAGENS[ultimo];
    navigator.share({title:"Uma mensagem para você", text:"“"+m.v+"” ("+m.r+")\n\n"+m.f+"\n\nACAMPs 2027 · Comunidade Católica Shalom de Santos", url:location.href}).catch(()=>{});
  });
}
