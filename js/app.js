/* ============================ perfil e dados ============================ */
const PERFIL_KEY = 'mais-um-perfil';
let PERFIL = null, PLAN = {}, META = {}, KEY = '', db = null;

function load(){
  try{
    let raw = localStorage.getItem(KEY);
    if(!raw && PERFIL.id==='matheus') raw = localStorage.getItem('meu-treino-v1'); // versão antiga
    const d = JSON.parse(raw); if(d && d.sessions) return d;
  }catch(e){}
  return { sessions:[], body:[], drafts:{}, seeded:false };
}
// plano editado no app fica em db.plan (vai junto no backup); sem ele, usa o padrão do perfil
function applyPlan(){ PLAN = db.plan || PERFIL.plan; if(!PLAN[st.w]) st.w = Object.keys(PLAN)[0]; }
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(db)); }
  catch(e){ toast('Não consegui salvar neste navegador'); }
}
function setPerfil(id){
  PERFIL = { id, ...PERFIS[id] }; META = PERFIL.meta;
  KEY = 'mais-um-v1:' + id;
  db = load(); applyPlan();
  if(!db.seeded){ if(PERFIL.seedBody) db.body.push(PERFIL.seedBody); db.seeded = true; save(); }
  document.documentElement.dataset.profile = id;
  document.querySelector('meta[name="theme-color"]').content = PERFIL.themeColor;
  st.dia = (new Date().getDay()+6)%7; st.w = treinoDoDia(st.dia) || st.w;
}
function sairPerfil(){
  PERFIL = null; db = null;
  try{ localStorage.removeItem(PERFIL_KEY); }catch(e){}
  try{ history.replaceState(null,'',location.pathname); }catch(e){}
  document.documentElement.removeAttribute('data-profile');
}

/* ============================ helpers ============================ */
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2,'0');
const today = () => { const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const fmtDate = iso => { const [y,m,d]=iso.split('-'); return `${d}/${m}`; };
const fmt = n => (Math.round(n*100)/100).toString().replace('.',',');
const num = v => { const n = parseFloat(String(v).replace(',','.')); return isNaN(n) ? 0 : n; };
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const range = ex => ex.r[0]===ex.r[1] ? `${ex.r[0]}` : `${ex.r[0]}–${ex.r[1]}`;
let toastT;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),1600+msg.length*35); }

/* mensagens: tom de parceiro de treino, curto e sem cobrança (identidade Mais Um) */
const FRASES_SERIE = ['Boa! Só mais um.','Bateu? Anota.','Série no bolso.','Isso! Respira e vai de novo.','Mais uma feita.','Firme. Próxima.'];
const FRASES_FIM = ['Hoje foi +1.','Veio, treinou, anotou. É isso.','Mais um treino no bolso.'];
let fraseN = Math.floor(Math.random()*10);
const frase = lista => lista[fraseN++ % lista.length]; // gira a lista para não repetir seguido
function msgSerie(ex, sets, i){
  const s=sets[i], l=lastOf(ex.id), p=l&&l.sets[Math.min(i,l.sets.length-1)], kg=num(s.kg), reps=Math.round(num(s.reps));
  if(p && !ex.semCarga && kg>p.kg) return `Carga nova: ${fmt(kg)} kg. Hoje foi +1!`;
  if(p && reps>p.reps && (ex.semCarga || kg>=p.kg)) return `+${reps-p.reps} ${ex.u==='s'?'s':'rep'} que a última vez. Isso é o mais um!`;
  if(sets.every(x=>x.done)) return 'Exercício fechado! Bora pro próximo.';
  return frase(FRASES_SERIE);
}

const st = { tab:'treino', w:'A', dia:0, ex:0, lista:false, edit:false, reg:false, pex:'', pmodo:'kg' };
// i = 0 (segunda) a 6 (domingo); o dia vem do começo do campo "dia" do treino (ex.: 'Segunda · 12h')
const nomeDia = i => DIAS[(i+1)%7];
const treinoDoDia = i => Object.keys(PLAN).find(k=>PLAN[k].dia.split(' ')[0].toLowerCase()===nomeDia(i).toLowerCase());

const sortedSessions = () => [...db.sessions].sort((a,b)=> (a.date+a.id).localeCompare(b.date+b.id));
function historyOf(exId){
  return sortedSessions().filter(s=>s.sets[exId] && s.sets[exId].length).map(s=>({date:s.date, sets:s.sets[exId]}));
}
const lastOf = exId => { const h=historyOf(exId); return h[h.length-1]; };
const topKg = sets => Math.max(0,...sets.map(s=>s.kg||0));

function draftSets(w, ex){
  if(!db.drafts[w]) db.drafts[w]={sets:{}};
  const d=db.drafts[w];
  if(!d.sets[ex.id]) d.sets[ex.id]=Array.from({length:ex.s},()=>({kg:'',reps:'',done:false}));
  return d.sets[ex.id];
}

function hintFor(ex,last){
  if(!last) return '';
  const done = last.sets.filter(s=>s.reps>0);
  const hitTop = done.length>=ex.s && done.every(s=>s.reps>=ex.r[1]);
  if(ex.semCarga){
    return hitTop ? 'Bateu o topo nas séries: aumente o tempo/reps.' : '';
  }
  const kg = topKg(last.sets);
  if(hitTop && kg>0){
    const lo = Math.round(kg*1.02*2)/2, hi = Math.max(lo, Math.round(kg*1.05*2)/2);
    return `Fechou o topo (${ex.r[1]} reps). Suba a carga: ${fmt(Math.max(lo,kg+0.5))}–${fmt(Math.max(hi,kg+0.5))} kg.`;
  }
  return kg>0 ? `Mantenha ${fmt(kg)} kg e busque ${ex.r[1]} reps em todas as séries.` : '';
}

/* ============================ views ============================ */
const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
function semana(){ // segunda a domingo da semana atual, em ISO
  const d=new Date(); d.setDate(d.getDate()-(d.getDay()+6)%7);
  return Array.from({length:7},(_,i)=>{ const x=new Date(d); x.setDate(d.getDate()+i); return isoOf(x); });
}
function recordesSemana(dias){ // exercícios cuja carga desta semana passou a maior anterior
  let n=0;
  Object.values(PLAN).forEach(w=>w.ex.forEach(ex=>{
    if(ex.semCarga) return;
    const h=historyOf(ex.id), antes=h.filter(x=>x.date<dias[0]), agora=h.filter(x=>x.date>=dias[0]);
    if(antes.length && agora.length && Math.max(...agora.map(x=>topKg(x.sets))) > Math.max(...antes.map(x=>topKg(x.sets)))) n++;
  }));
  return n;
}

function viewHoje(){
  const k=treinoDoDia(st.dia), w=k&&PLAN[k], hoje=new Date(), dias=semana(), feitos=new Set(db.sessions.map(s=>s.date));
  const rotulo = dias[st.dia]===today() ? 'Treino de hoje' : `Treino de ${nomeDia(st.dia).toLowerCase()}`;
  let h = `<div class="hoje-top"><div><p class="sub">${DIAS[hoje.getDay()]}, ${hoje.getDate()} de ${MESES[hoje.getMonth()]}</p>
      <h1>Oi, ${esc(PERFIL.nome)}</h1></div><div class="avatar" style="background:${PERFIL.cor}">${esc(PERFIL.nome[0])}</div></div>
    <div class="semana">${dias.map((d,i)=>`<button class="${i===st.dia?'on':''} ${d===today()?'hj':''}" data-act="dia" data-i="${i}" aria-label="${nomeDia(i)}${treinoDoDia(i)?'':', sem treino'}" aria-pressed="${i===st.dia}"><span>${'STQQSSD'[i]}</span><i class="${feitos.has(d)?'f':''}"></i></button>`).join('')}</div>
    <section class="hero"><div class="hero-bg" aria-hidden="true">+1</div>
      <p class="eyebrow">${rotulo}</p>` + (w ? `<p class="hero-t">${esc(w.nome)}</p>
      <p class="hero-s">Treino ${k} · ${w.ex.length} exercícios · ${w.ex.reduce((t,ex)=>t+ex.s,0)} séries</p>
      <button class="btn plus" data-act="start" data-w="${k}">Começar treino</button></section>`
    : `<p class="hero-t folga">Não há treino neste dia</p>
      <p class="hero-s" style="margin:0">Descanso também faz parte do treino.</p>
      <button class="link hero-link" data-act="novo">+ Criar novo treino para ${nomeDia(st.dia).toLowerCase()}</button></section>`);
  if(PERFIL.hojeResumo){
    const nSem=db.sessions.filter(s=>s.date>=dias[0]).length, total=Object.keys(PLAN).length, rec=recordesSemana(dias);
    const falta=total-nSem;
    h += `<div class="duo"><div class="card"><b class="destaque">+${rec}</b><small>recorde${rec===1?'':'s'} esta semana</small></div>
      <div class="card"><b>${Math.min(nSem,total)} de ${total}</b><small>treinos da semana</small></div></div>
      <div class="frase"><b>+1</b><span>${falta>1?`Faltam ${falta} treinos para fechar a semana.`:falta===1?'Só mais um treino e a semana fecha completa.':'Semana completa. Hoje foi +1.'}</span></div>`;
  } else if(w){
    const ult=w.ex.map(ex=>({ex,l:lastOf(ex.id)})).filter(x=>x.l);
    h += `<p class="eyebrow" style="margin-top:20px">Última vez</p>` + (ult.length ? ult.map(({ex,l})=>
      `<div class="card linha"><div><b>${esc(ex.n)}</b><small>${l.sets.length} × ${Math.max(...l.sets.map(s=>s.reps))}${ex.u||''}</small></div>
      <span>${ex.semCarga?'':fmt(topKg(l.sets))+' kg'}</span></div>`).join('') : `<p class="empty">Primeiro treino ${st.w}: anote como foi.</p>`);
  }
  return h;
}


function viewTreino(){
  const w = PLAN[st.w];
  if(st.edit) return `<button class="link" data-act="hoje">‹ Hoje</button><h1>Treino ${st.w} · ${esc(w.nome)}</h1>
    <p class="sub">${esc(w.dia)}</p>` + viewEditar(w);
  const first = sortedSessions()[0];
  const early = !first || (Date.now() - new Date(first.date+'T12:00:00')) < 14*864e5;
  st.ex = Math.min(st.ex, w.ex.length-1);
  if(st.lista) return viewLista(w);
  const ex = w.ex[st.ex], sets = draftSets(st.w, ex), last = lastOf(ex.id), hint = hintFor(ex,last);
  const cur = sets.findIndex(s=>!s.done), un = ex.u==='s'?'segundos':ex.u==='min'?'minutos':'repetições';
  const ph = i => last && last.sets[Math.min(i,last.sets.length-1)];
  const txt = s => ex.semCarga ? `${s.reps}${ex.u||' reps'}` : `${s.reps} reps · ${fmt(num(s.kg))} kg`;
  // carga sugerida: a da série anterior de hoje, senão a da mesma série na última vez
  if(cur>=0 && !ex.semCarga && sets[cur].kg===''){ const k = cur ? sets[cur-1].kg : (ph(0)&&ph(0).kg); if(k) sets[cur].kg = fmt(num(k)); }
  if(cur>0 && sets[cur].reps==='') sets[cur].reps = sets[cur-1].reps; // repete as reps da série anterior; ajusta com −1 ou digitando

  let h = `<div class="reg-top"><button class="voltar" data-act="exprev" aria-label="Voltar">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><p class="eyebrow">${esc(w.nome)} · ${st.ex+1} de ${w.ex.length}</p><h1 class="reg-t">${esc(ex.n)}</h1></div>
    <button class="voltar lista-btn" data-act="lista" aria-label="Ver todos os exercícios do treino">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01"/></svg></button></div>`;
  if(st.ex===0 && PERFIL.aviso) h += `<p class="tip">${esc(PERFIL.aviso)}</p>`;
  if(st.ex===0 && early && PERFIL.dicaInicio) h += `<p class="tip">${esc(PERFIL.dicaInicio)}</p>`;
  h += `<div class="ultima"><span>Última vez</span><b>${last ? `${last.sets.length} × ${Math.max(...last.sets.map(s=>s.reps))}${ex.u||''}${ex.semCarga?'':' · '+fmt(topKg(last.sets))+' kg'}` : 'Primeira vez'}</b></div>
    <p class="meta-ex">Meta: ${ex.s} × ${range(ex)}${ex.u||''}</p>${hint?`<p class="hint">${hint}</p>`:''}`;
  if(cur>=0){
    const s = sets[cur], p = ph(cur);
    h += `<div class="contador"><label for="reps">Série ${cur+1} de ${sets.length} · ${un}</label>
      <input id="reps" class="big" inputmode="numeric" autocomplete="off" placeholder="${p&&p.reps?p.reps:0}" value="${esc(s.reps)}" data-ex="${ex.id}" data-i="${cur}" data-f="reps"></div>
      ${ex.semCarga?'':`<div class="kg"><button data-act="kg" data-d="-2.5" aria-label="Diminuir carga">−</button>
        <label><input inputmode="decimal" autocomplete="off" placeholder="0" value="${esc(s.kg)}" data-ex="${ex.id}" data-i="${cur}" data-f="kg" aria-label="Carga em kg"> kg</label>
        <button data-act="kg" data-d="2.5" aria-label="Aumentar carga">+</button></div>`}
      <div class="reps-btns"><button class="menos1" data-act="reps" data-n="-1" aria-label="Tirar 1">−1</button>
        <button class="btn mais1" data-act="reps" data-n="1" aria-label="Somar 1">+1</button>
        <button class="menos1" data-act="reps" data-n="5" aria-label="Somar 5">+5</button>
        <button class="menos1" data-act="reps" data-n="10" aria-label="Somar 10">+10</button></div>
      <button class="btn" data-act="serie">Concluir série</button>`;
  } else {
    h += `<p class="tip">Todas as séries feitas. ${st.ex<w.ex.length-1?'Bora para o próximo.':'Agora é só finalizar.'}</p>`;
  }
  const feitas = sets.map((s,i)=>({s,i})).filter(x=>x.s.done);
  h += `<div class="feitas">${feitas.length ? feitas.map(({s,i})=>`<button class="feita" data-act="chk" data-ex="${ex.id}" data-i="${i}" aria-label="Série ${i+1} feita, tocar para refazer">
      <span class="ok">✓</span><b>Série ${i+1}</b><span>${txt(s)}</span></button>`).join('')
    : `<p class="empty">Some com +1, +5 ou +10 (−1 corrige). Ou toque no número e digite.</p>`}</div>
    <div class="mini"><button class="link" data-act="addset" data-ex="${ex.id}">+ série</button>
      <button class="link" data-act="rmset" data-ex="${ex.id}">− série</button>
      <button class="link" data-act="edit">Editar plano</button></div>`;
  h += st.ex < w.ex.length-1
    ? `<button class="btn ${cur<0?'':'ghost'}" data-act="exnext">Próximo exercício ›</button>
       <button class="link fim" data-act="finish">Finalizar treino agora</button>`
    : `<button class="btn plus" data-act="finish">Finalizar treino ${st.w}</button>`;
  return h;
}

function viewLista(w){ // academia cheia: escolher qualquer exercício, fora de ordem
  let h = `<div class="reg-top"><button class="voltar" data-act="lista" aria-label="Voltar ao exercício">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div><p class="eyebrow">Treino ${st.w}</p><h1 class="reg-t">${esc(w.nome)}</h1></div></div>
    <p class="sub">Toque em qualquer exercício para fazer agora, na ordem que der.</p>`;
  w.ex.forEach((ex,i)=>{
    const sets=(db.drafts[st.w]&&db.drafts[st.w].sets[ex.id])||[], f=sets.filter(s=>s.done).length, tot=sets.length||ex.s;
    h += `<button class="feita ex-item ${i===st.ex?'atual':''}" data-act="irex" data-i="${i}">
      <span class="ok ${f>=tot?'':f?'meio':'zero'}">${f>=tot?'✓':i+1}</span><b>${esc(ex.n)}</b><span>${f}/${tot}</span></button>`;
  });
  return h + `<button class="btn plus" style="margin-top:14px" data-act="finish">Finalizar treino ${st.w}</button>`;
}

function viewEditar(w){
  const inp = (i,f,v,mode) => `<input inputmode="${mode}" autocomplete="off" value="${esc(v)}" data-pe="${f}" data-i="${i}">`;
  let h = `<p class="tip">Editando o treino ${st.w}. O histórico continua ligado a cada exercício.</p>
    <section class="card"><div class="field"><label>Nome do treino</label>${inp(-1,'nome',w.nome,'text')}</div>
    <div class="field"><label>Dia</label>${inp(-1,'dia',w.dia,'text')}</div></section>`;
  w.ex.forEach((ex,i)=>{
    h += `<section class="card"><div class="field"><label>Exercício</label>${inp(i,'n',ex.n,'text')}</div>
      <div class="grid4 grid3"><div class="field"><label>Séries</label>${inp(i,'s',ex.s,'numeric')}</div>
      <div class="field"><label>Reps mín.</label>${inp(i,'r0',ex.r[0],'numeric')}</div>
      <div class="field"><label>Reps máx.</label>${inp(i,'r1',ex.r[1],'numeric')}</div></div>
      <div class="mini"><button class="link" data-act="exup" data-i="${i}">↑ subir</button>
      <button class="link" data-act="exdel" data-i="${i}">remover</button></div></section>`;
  });
  return h + `<button class="btn ghost" data-act="exadd">+ exercício</button>
    <button class="btn" data-act="editok">Concluir edição</button>
    ${Object.keys(PLAN).length>1?'<button class="btn danger" data-act="treinodel">Excluir este treino</button>':''}
    ${db.plan?'<button class="btn danger" data-act="planreset">Voltar ao plano padrão</button>':''}`;
}

const semanaDe = iso => { const d=new Date(iso+'T12:00:00'); d.setDate(d.getDate()-(d.getDay()+6)%7); return isoOf(d); };
function ultimoRecorde(){ // a vez mais recente em que a carga de um exercício passou a maior anterior
  let r=null;
  Object.values(PLAN).forEach(w=>w.ex.forEach(ex=>{
    if(ex.semCarga) return;
    let max=0;
    historyOf(ex.id).forEach(x=>{ const kg=topKg(x.sets);
      if(max && kg>max && (!r || x.date>=r.date)) r={date:x.date, ex, kg, reps:Math.max(...x.sets.filter(s=>s.kg===kg).map(s=>s.reps))};
      max=Math.max(max,kg); });
  }));
  return r;
}
function semanasSeguidas(){
  const sem=new Set(db.sessions.map(x=>semanaDe(x.date))), d=new Date(semana()[0]+'T12:00:00');
  if(!sem.has(isoOf(d))) d.setDate(d.getDate()-7); // semana atual ainda pode estar em andamento
  let n=0; while(sem.has(isoOf(d))){ n++; d.setDate(d.getDate()-7); }
  return n;
}

function viewProgresso(){
  const total = db.sessions.length;
  let h = `<p class="sub" style="margin:0 0 2px;font-weight:700">Seu progresso</p>`;
  const exs = Object.values(PLAN).flatMap(w=>w.ex).filter(ex=>historyOf(ex.id).length);
  if(!exs.length) return h + `<h1>Progresso</h1><p class="empty">Ainda não há treinos salvos. Finalize um treino para ver a evolução aqui.</p>` + listaSessoes();
  if(!exs.some(e=>e.id===st.pex)){ const ult=[...sortedSessions()].reverse().find(x=>exs.some(e=>x.sets[e.id])); st.pex=exs.find(e=>ult.sets[e.id]).id; }
  const ex = exs.find(e=>e.id===st.pex);
  const modos = ex.semCarga ? [['reps', ex.u==='s'?'Segundos':'Repetições']] : [['kg','Carga'],['reps','Repetições']];
  if(!modos.some(m=>m[0]===st.pmodo)) st.pmodo = modos[0][0];
  const val = sets => st.pmodo==='kg' ? topKg(sets) : Math.max(...sets.map(s=>s.reps||0));
  const un = st.pmodo==='reps' ? (ex.u ? ex.u : ' reps') : ' kg';
  const porSem = new Map();
  historyOf(ex.id).forEach(x=>{ const k=semanaDe(x.date), v=val(x.sets); porSem.set(k, Math.max(porSem.get(k)||0, v)); });
  const sem = [...porSem.entries()].slice(-8), hi = Math.max(...sem.map(x=>x[1])), lo = Math.min(...sem.map(x=>x[1]));
  // escala a partir do menor valor (como no protótipo), para a evolução aparecer; o número exato está no topo e no histórico
  const alt = v => hi===lo ? 60 : Math.round(25 + 75*(v-lo)/(hi-lo));
  const now = sem[sem.length-1][1], d = now - sem[0][1];

  h += `<label class="pex"><span class="sr">Exercício</span><select id="pex">${exs.map(e=>`<option value="${e.id}" ${e===ex?'selected':''}>${esc(e.n)}</option>`).join('')}</select></label>
    <div class="seg" role="group" aria-label="Medida">${modos.map(([k,l])=>`<button class="${k===st.pmodo?'on':''}" data-act="pmodo" data-m="${k}" aria-pressed="${k===st.pmodo}">${l}</button>`).join('')}</div>
    <section class="card grafico"><div class="graf-top"><b>${fmt(now)}${un}</b>
      ${sem.length>1?`<span>${d>0?'+':''}${fmt(d)}${un} em ${sem.length} semanas</span>`:''}</div>
      <div class="barras" role="img" aria-label="${sem.map(([k,v])=>`semana de ${fmtDate(k)}: ${fmt(v)}${un}`).join('; ')}">
      ${sem.map(([k,v],i)=>`<div><i style="height:${alt(v)}%" class="${i===sem.length-1?'ult':''}"></i><span>${fmtDate(k)}</span></div>`).join('')}</div>
      <details><summary>Histórico (${historyOf(ex.id).length})</summary><ul class="hist">
      ${[...historyOf(ex.id)].reverse().map(x=>`<li>${fmtDate(x.date)} — <span>${x.sets.map(s=>ex.semCarga?`${s.reps}${ex.u||''}`:`${fmt(s.kg)}×${s.reps}`).join(' · ')}</span></li>`).join('')}
      </ul></details></section>`;
  const rec = ultimoRecorde();
  if(rec) h += `<section class="recorde"><div class="trofeu"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0z M8 6H5a3 3 0 0 0 3 4 M16 6h3a3 3 0 0 1-3 4 M12 13v4 M8 20h8"/></svg></div>
    <div><b>Novo recorde!</b><span>${esc(rec.ex.n)} · ${fmt(rec.kg)} kg × ${rec.reps} · ${rec.date===today()?'hoje':fmtDate(rec.date)}</span></div></section>`;
  const nSem = db.sessions.filter(x=>x.date>=semana()[0]).length, seg = semanasSeguidas();
  h += `<div class="duo prog"><div class="card"><b>${nSem}</b><small>treino${nSem===1?'':'s'} na semana</small></div>
    <div class="card"><b class="destaque">${seg} sem.</b><small>sem faltar</small></div></div>`;
  return h + listaSessoes();
}
function listaSessoes(){
  const total=db.sessions.length;
  if(!total) return '';
  return `<details class="card"><summary>Treinos registrados (${total})</summary><ul class="hist">${[...sortedSessions()].reverse().map(x=>
    `<li class="sess"><span>${fmtDate(x.date)}/${x.date.slice(2,4)} · Treino ${esc(x.workout)}${PLAN[x.workout]?' · '+esc(PLAN[x.workout].nome):''} · ${Object.keys(x.sets).length} exerc.</span>
    <button class="link" data-act="delsess" data-id="${esc(x.id)}">excluir</button></li>`).join('')}</ul></details>`;
}

function viewCorpo(){
  const list = [...db.body].sort((a,b)=>b.date.localeCompare(a.date));
  const cur = list[0] || {};
  let h = `<p class="eyebrow">Seu corpo</p><h1>Corpo</h1><p class="sub">Meça sempre nas mesmas condições (manhã, em jejum, após ir ao banheiro).</p>
  <section class="card"><div class="goal">
    <div><small>Peso atual</small><b>${cur.peso?fmt(cur.peso)+' kg':'—'}</b><small>meta ${META.til||''}${META.peso} kg</small></div>
    ${META.gordura?`<div><small>Gordura atual</small><b>${cur.gordura?fmt(cur.gordura)+'%':'—'}</b><small>meta ${META.til||''}${META.gordura}%</small></div>`:''}
  </div></section>
  <section class="card"><h3 style="margin-bottom:10px">Nova medição</h3>
    <form id="bodyForm"><div class="grid4">
      <div class="field"><label>Data</label><input type="date" name="date" value="${today()}" required></div>
      <div class="field"><label>Peso (kg)</label><input name="peso" inputmode="decimal" placeholder="ex.: 75,8" required></div>
      <div class="field"><label>Gordura (%)</label><input name="gordura" inputmode="decimal" placeholder="opcional"></div>
      <div class="field"><label>Massa muscular (kg)</label><input name="musculo" inputmode="decimal" placeholder="opcional"></div>
      <div class="field"><label>Gordura visceral</label><input name="visceral" inputmode="decimal" placeholder="opcional"></div>
    </div><button class="btn" style="margin-top:12px" type="submit">Salvar medição</button></form></section>
  <h2>Histórico</h2>`;
  if(!list.length) return h + `<p class="empty">Nenhuma medição ainda.</p>`;
  list.forEach((m,i)=>{
    const prev = list[i+1];
    const dl = (k,inv)=>{ if(!prev||!m[k]||!prev[k]) return ''; const d=m[k]-prev[k]; if(!d) return '';
      const good = inv ? d<0 : d>0; return ` <span class="delta ${good?'up':'down'}">${d>0?'+':''}${fmt(d)}</span>`; };
    h += `<section class="card"><header><h3>${fmtDate(m.date)}/${m.date.slice(0,4)}</h3>
      <button class="link" data-act="delbody" data-date="${m.date}" data-peso="${m.peso}">excluir</button></header>
      <div class="stat"><span>Peso</span><span class="v">${fmt(m.peso)} kg${dl('peso',true)}</span></div>
      ${m.gordura?`<div class="stat"><span>Gordura</span><span class="v">${fmt(m.gordura)}%${dl('gordura',true)}</span></div>`:''}
      ${m.gordura&&m.peso?`<div class="stat"><span>Massa de gordura</span><span class="v">${fmt(m.peso*m.gordura/100)} kg</span></div>`:''}
      ${m.musculo?`<div class="stat"><span>Massa muscular</span><span class="v">${fmt(m.musculo)} kg${dl('musculo',false)}</span></div>`:''}
      ${m.visceral?`<div class="stat"><span>Gordura visceral</span><span class="v">${fmt(m.visceral)}${dl('visceral',true)}</span></div>`:''}
    </section>`;
  });
  return h;
}

function viewDados(){
  return `<p class="eyebrow">Perfil: ${esc(PERFIL.nome)}</p><h1>Dados</h1><p class="sub">Tudo fica salvo neste navegador, neste aparelho. Faça backup de vez em quando.</p>
    <button class="btn" data-act="export">Baixar backup (.json)</button>
    <label class="btn ghost" style="text-align:center;cursor:pointer">Restaurar backup<input type="file" id="imp" accept="application/json,.json"></label>
    <h2>Perfil</h2><button class="btn ghost" data-act="trocar">Trocar de perfil</button>
    <h2>Cuidado</h2><button class="btn danger" data-act="wipe">Apagar todos os dados</button>`;
}

// símbolo da marca; cores vêm do CSS (.logo / .splash). Não distorcer nem girar
const LOGO = `<svg viewBox="0 18 240 112" aria-hidden="true"><g class="pl"><rect x="40" y="82" width="160" height="12" rx="6"/><rect x="26" y="62" width="18" height="52" rx="9"/><rect x="50" y="50" width="20" height="76" rx="10"/><rect x="170" y="50" width="20" height="76" rx="10"/><rect x="196" y="62" width="18" height="52" rx="9"/></g><path d="M99 64 V48 a21 21 0 0 1 42 0 V64" fill="none" class="kb-a" stroke-width="11" stroke-linecap="round"/><rect class="kb" x="86" y="54" width="68" height="68" rx="28"/><path class="um" d="M101 89 H119 M110 80 V98 M129 82 L136 77 V101" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
function viewPerfis(){
  return `<div class="splash-bg" aria-hidden="true">+1</div>
    <div class="splash-mid">${LOGO}<h1>mais um</h1><p>Toda evolução começa com mais um.</p></div>
    <div class="splash-btns">${Object.entries(PERFIS).map(([id,p],i)=>
      `<button class="btn ${i?'out':'plus'}" data-act="perfil" data-id="${id}">Entrar como ${esc(p.nome)}</button>`).join('')}</div>`;
}

function render(){
  document.body.classList.toggle('splash', !PERFIL);
  if(!PERFIL){ document.querySelector('meta[name="theme-color"]').content='#6C47FF'; $('#app').innerHTML = viewPerfis(); $('#nav').style.display='none'; return; }
  $('#nav').style.display='';
  const v = {treino:()=>st.reg?viewTreino():viewHoje(), progresso:viewProgresso, corpo:viewCorpo, dados:viewDados}[st.tab];
  $('#app').innerHTML = v();
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on', b.dataset.tab===st.tab));
}

/* ============================ eventos ============================ */
function editPlan(){ if(!db.plan){ db.plan=JSON.parse(JSON.stringify(PERFIL.plan)); applyPlan(); } return db.plan; }
function exById(id){ for(const w of Object.values(PLAN)){ const e=w.ex.find(x=>x.id===id); if(e) return e; } }

$('#nav').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  st.tab=b.dataset.tab; st.reg=false; st.edit=false; st.lista=false; render(); window.scrollTo(0,0);
});

$('#app').addEventListener('input', e=>{
  const t=e.target;
  if(t.dataset.pe){ // sem render aqui para não perder o foco do campo
    const w=editPlan()[st.w], f=t.dataset.pe, ex=w.ex[+t.dataset.i];
    if(f==='nome'||f==='dia') w[f]=t.value;
    else if(f==='n') ex.n=t.value;
    else { const n=Math.max(1,Math.round(num(t.value))); if(f==='s') ex.s=n; else ex.r[f==='r0'?0:1]=n; }
    save(); return;
  }
  if(!t.dataset.f) return;
  const sets = db.drafts[st.w].sets[t.dataset.ex];
  sets[+t.dataset.i][t.dataset.f] = t.value;
  save();
});

$('#app').addEventListener('click', e=>{
  const b=e.target.closest('[data-act]'); if(!b) return;
  const act=b.dataset.act;

  if(act==='perfil'){
    try{ localStorage.setItem(PERFIL_KEY,b.dataset.id); }catch(e){}
    setPerfil(b.dataset.id); st.tab='treino'; render(); window.scrollTo(0,0);
  }
  else if(act==='trocar'){ sairPerfil(); render(); window.scrollTo(0,0); }

  else if(act==='edit'){ st.edit=true; render(); window.scrollTo(0,0); }
  else if(act==='editok'){
    PLAN[st.w].ex.forEach(ex=>{ if(ex.r[0]>ex.r[1]) ex.r.reverse(); if(!ex.n.trim()) ex.n='Exercício'; });
    st.edit=false; save(); render(); window.scrollTo(0,0); toast('Plano salvo');
  }
  else if(act==='exadd'){ editPlan()[st.w].ex.push({id:'ex-'+Date.now(), n:'Novo exercício', s:3, r:[10,12]}); save(); render(); }
  else if(act==='exdel'){ const a=editPlan()[st.w].ex; if(a.length>1 && confirm(`Remover "${a[+b.dataset.i].n}"? O histórico dele fica guardado.`)){ a.splice(+b.dataset.i,1); save(); render(); } }
  else if(act==='exup'){ const a=editPlan()[st.w].ex, i=+b.dataset.i; if(i>0){ [a[i-1],a[i]]=[a[i],a[i-1]]; save(); render(); } }
  else if(act==='planreset'){ if(confirm('Voltar ao plano padrão? Suas edições no plano serão perdidas.')){ delete db.plan; applyPlan(); st.edit=false; save(); render(); } }

  else if(act==='dia'){ st.dia=+b.dataset.i; st.w=treinoDoDia(st.dia)||st.w; render(); }
  else if(act==='novo'){
    const p=editPlan(), k=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find(l=>!p[l]);
    p[k]={ nome:'Novo treino', dia:nomeDia(st.dia), ex:[{id:'ex-'+Date.now(), n:'Novo exercício', s:3, r:[10,12]}] };
    st.w=k; st.ex=0; st.reg=true; st.edit=true; save(); render(); window.scrollTo(0,0);
  }
  else if(act==='treinodel'){
    if(confirm(`Excluir o treino ${st.w} (${PLAN[st.w].nome})? O histórico dos exercícios fica guardado.`)){
      delete editPlan()[st.w]; delete db.drafts[st.w]; applyPlan(); st.edit=false; st.reg=false; save(); render(); window.scrollTo(0,0);
    }
  }
  else if(act==='start'){ st.w=b.dataset.w; st.ex=0; st.lista=false; st.reg=true; render(); window.scrollTo(0,0); }
  else if(act==='hoje'){ st.reg=false; st.edit=false; render(); window.scrollTo(0,0); }

  else if(act==='chk'){
    const ex=exById(b.dataset.ex), s=db.drafts[st.w].sets[ex.id][+b.dataset.i];
    s.done=!s.done;
    if(s.done){ // um toque repete a última vez, se não digitou nada
      const last=lastOf(ex.id), ph=last&&last.sets[Math.min(+b.dataset.i,last.sets.length-1)];
      if(ph){ if(!s.kg && ph.kg && !ex.semCarga) s.kg=String(ph.kg); if(!s.reps && ph.reps) s.reps=String(ph.reps); }
    }
    save(); render();
  }

  else if(act==='pmodo'){ st.pmodo=b.dataset.m; render(); }
  else if(act==='lista'){ st.lista=!st.lista; render(); window.scrollTo(0,0); }
  else if(act==='irex'){ st.ex=+b.dataset.i; st.lista=false; render(); window.scrollTo(0,0); }
  else if(act==='exnext'){ st.ex++; render(); window.scrollTo(0,0); }
  else if(act==='exprev'){ if(st.ex>0) st.ex--; else st.reg=false; render(); window.scrollTo(0,0); }
  else if(act==='reps'||act==='kg'||act==='serie'){
    const ex=PLAN[st.w].ex[st.ex], sets=draftSets(st.w,ex), i=sets.findIndex(x=>!x.done), s=sets[i];
    if(!s) return;
    if(act==='reps') s.reps=String(Math.max(0,Math.round(num(s.reps))+ +b.dataset.n));
    else if(act==='kg') s.kg=fmt(Math.max(0, num(s.kg)+ +b.dataset.d));
    else {
      if(!num(s.reps)){ const l=lastOf(ex.id), p=l&&l.sets[Math.min(i,l.sets.length-1)];
        if(p&&p.reps) s.reps=String(p.reps); else { toast('Conte as repetições com +1 ou digite'); return; } }
      s.done=true;
      toast(msgSerie(ex, sets, i));
    }
    save(); render();
  }
  else if(act==='addset'){ db.drafts[st.w].sets[b.dataset.ex].push({kg:'',reps:'',done:false}); save(); render(); }
  else if(act==='rmset'){ const a=db.drafts[st.w].sets[b.dataset.ex]; if(a.length>1){ a.pop(); save(); render(); } }

  else if(act==='finish'){
    const w=PLAN[st.w], sets={};
    w.ex.forEach(ex=>{
      const rows = (db.drafts[st.w].sets[ex.id]||[])
        .map(s=>({kg:num(s.kg), reps:Math.round(num(s.reps))}))
        .filter(s=>s.reps>0);
      if(rows.length) sets[ex.id]=rows;
    });
    if(!Object.keys(sets).length){ toast('Preencha ao menos uma série'); return; }
    const recs = w.ex.filter(ex=>{ if(ex.semCarga||!sets[ex.id]) return false; const h=historyOf(ex.id);
      return h.length && topKg(sets[ex.id]) > Math.max(...h.map(x=>topKg(x.sets))); });
    db.sessions.push({ id:String(Date.now()), date:today(), workout:st.w, sets });
    delete db.drafts[st.w]; st.reg=false; save(); render(); window.scrollTo(0,0);
    toast(recs.length ? `Treino salvo! Recorde em ${recs.map(e=>e.n).join(', ')}. Hoje foi +1.` : `Treino salvo! ${frase(FRASES_FIM)}`);
  }

  else if(act==='delsess'){
    const x=db.sessions.find(x=>x.id===b.dataset.id);
    if(x && confirm(`Excluir o treino ${x.workout} de ${fmtDate(x.date)}? Isso apaga as séries registradas nele.`)){
      db.sessions=db.sessions.filter(y=>y!==x); save(); render(); toast('Treino excluído');
    }
  }
  else if(act==='delbody'){
    if(confirm('Excluir esta medição?')){ db.body=db.body.filter(m=>!(m.date===b.dataset.date && String(m.peso)===b.dataset.peso)); save(); render(); }
  }

  else if(act==='export'){
    const blob=new Blob([JSON.stringify(db,null,1)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`mais-um-${PERFIL.id}-${today()}.json`; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  else if(act==='wipe'){
    if(confirm('Apagar TODOS os treinos e medições deste navegador?')){
      db={ sessions:[], body:[], drafts:{}, seeded:true }; applyPlan(); save(); render(); toast('Dados apagados');
    }
  }
});

$('#app').addEventListener('submit', e=>{
  if(e.target.id!=='bodyForm') return;
  e.preventDefault();
  const f=new FormData(e.target), m={ date:f.get('date'), peso:num(f.get('peso')) };
  ['gordura','musculo','visceral'].forEach(k=>{ const v=num(f.get(k)); if(v) m[k]=v; });
  if(!m.peso){ toast('Informe o peso'); return; }
  db.body.push(m); save(); render(); toast('Medição salva');
});

$('#app').addEventListener('change', e=>{
  if(e.target.id==='pex'){ st.pex=e.target.value; render(); return; }
  if(e.target.id!=='imp') return;
  const file=e.target.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=()=>{ try{
      const d=JSON.parse(r.result);
      if(!d.sessions||!d.body) throw 0;
      db={ drafts:{}, seeded:true, ...d }; applyPlan(); save(); render(); toast('Backup restaurado');
    }catch(err){ toast('Arquivo inválido'); } };
  r.readAsText(file);
});

(function init(){
  let id = null;
  try{
    const q = new URLSearchParams(location.search).get('perfil');
    if(q && PERFIS[q]){ id=q; localStorage.setItem(PERFIL_KEY,q); }
    else id = localStorage.getItem(PERFIL_KEY);
  }catch(e){}
  if(id && PERFIS[id]) setPerfil(id);
  render();
})();
