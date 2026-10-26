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
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(db)); }
  catch(e){ toast('Não consegui salvar neste navegador'); }
}
function setPerfil(id){
  PERFIL = { id, ...PERFIS[id] }; PLAN = PERFIL.plan; META = PERFIL.meta;
  KEY = 'mais-um-v1:' + id;
  db = load();
  if(!db.seeded){ if(PERFIL.seedBody) db.body.push(PERFIL.seedBody); db.seeded = true; save(); }
  document.documentElement.dataset.profile = id;
  document.querySelector('meta[name="theme-color"]').content = PERFIL.themeColor;
  st.w = defaultWorkout();
}
function sairPerfil(){
  PERFIL = null; db = null;
  try{ localStorage.removeItem(PERFIL_KEY); }catch(e){}
  try{ history.replaceState(null,'',location.pathname); }catch(e){}
  document.documentElement.removeAttribute('data-profile');
  document.querySelector('meta[name="theme-color"]').content = '#0f1112';
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
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2000); }

const st = { tab:'treino', w:'A' };
function defaultWorkout(){ const d=new Date().getDay(); return [1,6,0].includes(d)?'A':[2,3].includes(d)?'B':'C'; }

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
function viewTreino(){
  const w = PLAN[st.w];
  const first = sortedSessions()[0];
  const early = !first || (Date.now() - new Date(first.date+'T12:00:00')) < 14*864e5;
  const monthPrefix = today().slice(0,7);
  const monthCount = db.sessions.filter(s=>s.date.startsWith(monthPrefix)).length;

  let h = `<p class="eyebrow">Mais Um · ${PERFIL.nome}</p><h1>Treino ${st.w} · ${w.nome}</h1>
    <p class="sub">${w.dia} · ${monthCount} treino${monthCount===1?'':'s'} neste mês</p>
    <div class="chips">${Object.entries(PLAN).map(([k,v])=>
      `<button class="chip ${k===st.w?'on':''}" data-act="pick" data-w="${k}"><b>${k}</b><small>${v.nome}</small></button>`).join('')}</div>`;
  if(PERFIL.aviso) h += `<p class="tip">${esc(PERFIL.aviso)}</p>`;
  if(early && PERFIL.dicaInicio) h += `<p class="tip">${esc(PERFIL.dicaInicio)}</p>`;

  w.ex.forEach(ex=>{
    const sets = draftSets(st.w, ex);
    const last = lastOf(ex.id);
    const hint = hintFor(ex,last);
    h += `<section class="card">
      <header><h3>${esc(ex.n)}</h3><span class="meta">${ex.s} × ${range(ex)}${ex.u||''}</span></header>
      <p class="last">${last ? 'Última vez ('+fmtDate(last.date)+'): '+last.sets.map(s=>ex.semCarga?`${s.reps}${ex.u||''}`:`${fmt(s.kg)}×${s.reps}`).join(' · ') : 'Primeira vez: anote como foi.'}</p>
      ${hint?`<p class="hint">${hint}</p>`:''}
      <div class="cols ${ex.semCarga?'noload':''}"><span>#</span>${ex.semCarga?'':'<span style="text-align:center">Carga (kg)</span>'}<span style="text-align:center">${ex.u==='s'?'Segundos':ex.u==='min'?'Minutos':'Reps'}</span><span></span></div>`;
    sets.forEach((s,i)=>{
      const ph = last && last.sets[Math.min(i,last.sets.length-1)];
      h += `<div class="row ${ex.semCarga?'noload':''} ${s.done?'done':''}"><span class="n">${i+1}</span>
        ${ex.semCarga?'':`<input inputmode="decimal" autocomplete="off" placeholder="${ph&&ph.kg?fmt(ph.kg):'kg'}" value="${esc(s.kg)}" data-ex="${ex.id}" data-i="${i}" data-f="kg">`}
        <input inputmode="numeric" autocomplete="off" placeholder="${ph&&ph.reps?ph.reps:(ex.u||'reps')}" value="${esc(s.reps)}" data-ex="${ex.id}" data-i="${i}" data-f="reps">
        <button class="chk" data-act="chk" data-ex="${ex.id}" data-i="${i}" aria-label="Concluir série">✓</button></div>`;
    });
    h += `<div class="mini"><button class="link" data-act="addset" data-ex="${ex.id}">+ série</button>
      <button class="link" data-act="rmset" data-ex="${ex.id}">− série</button></div></section>`;
  });
  h += `<button class="btn" data-act="finish">Finalizar treino ${st.w}</button>`;
  return h;
}

function spark(vals){
  if(vals.length<2) return '';
  const W=300,H=56,p=6, min=Math.min(...vals), max=Math.max(...vals), span=(max-min)||1;
  const pts = vals.map((v,i)=>[p+i*(W-2*p)/(vals.length-1), H-p-(v-min)/span*(H-2*p)]);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <polyline fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${pts.map(p=>p.join(',')).join(' ')}"/>
    ${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--accent)"/>`).join('')}</svg>`;
}

function viewProgresso(){
  const total = db.sessions.length;
  let h = `<h1>Progresso</h1><p class="sub">${total} treino${total===1?'':'s'} registrado${total===1?'':'s'}</p>`;
  if(!total) return h + `<p class="empty">Ainda não há treinos salvos. Finalize um treino para ver a evolução aqui.</p>`;
  Object.entries(PLAN).forEach(([k,w])=>{
    h += `<h2>Treino ${k} · ${w.nome}</h2>`;
    w.ex.forEach(ex=>{
      const hist = historyOf(ex.id);
      if(!hist.length) return;
      const vals = hist.map(x=> ex.semCarga ? Math.max(...x.sets.map(s=>s.reps||0)) : topKg(x.sets));
      const first=vals[0], now=vals[vals.length-1], d=now-first;
      const unit = ex.semCarga ? (ex.u||' reps') : ' kg';
      h += `<section class="card"><header><h3>${esc(ex.n)}</h3>
        <span class="meta">${fmt(now)}${unit} ${hist.length>1?`<span class="delta ${d>0?'up':d<0?'down':''}">${d>0?'+':''}${fmt(d)}</span>`:''}</span></header>
        ${spark(vals)}
        <details><summary>Histórico (${hist.length})</summary><ul class="hist">
        ${[...hist].reverse().map(x=>`<li>${fmtDate(x.date)} — <span>${x.sets.map(s=>ex.semCarga?`${s.reps}${ex.u||''}`:`${fmt(s.kg)}×${s.reps}`).join(' · ')}</span></li>`).join('')}
        </ul></details></section>`;
    });
  });
  return h;
}

function viewCorpo(){
  const list = [...db.body].sort((a,b)=>b.date.localeCompare(a.date));
  const cur = list[0] || {};
  let h = `<h1>Corpo</h1><p class="sub">Meça sempre nas mesmas condições (manhã, em jejum, após ir ao banheiro).</p>
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
  return `<h1>Dados</h1><p class="eyebrow">Perfil: ${PERFIL.nome}</p><p class="sub">Tudo fica salvo neste navegador, neste aparelho. Faça backup de vez em quando.</p>
  <section class="card">
    <button class="btn" data-act="export">Baixar backup (.json)</button>
    <label class="btn ghost" style="text-align:center;cursor:pointer">Restaurar backup<input type="file" id="imp" accept="application/json,.json"></label>
  </section>
  <section class="card"><button class="btn ghost" data-act="trocar">Trocar de perfil</button></section>
  <section class="card"><button class="btn danger" data-act="wipe">Apagar todos os dados</button></section>`;
}

function viewPerfis(){
  return `<h1>Mais Um</h1><p class="sub">Quem vai treinar?</p>` + Object.entries(PERFIS).map(([id,p])=>
    `<button class="card perfil" style="--c:${p.cor}" data-act="perfil" data-id="${id}"><b>${p.nome}</b><span>${p.resumo}</span></button>`).join('');
}

function render(){
  if(!PERFIL){ $('#app').innerHTML = viewPerfis(); $('#nav').style.display='none'; return; }
  $('#nav').style.display='';
  const v = {treino:viewTreino, progresso:viewProgresso, corpo:viewCorpo, dados:viewDados}[st.tab];
  $('#app').innerHTML = v();
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on', b.dataset.tab===st.tab));
}

/* ============================ eventos ============================ */
function exById(id){ for(const w of Object.values(PLAN)){ const e=w.ex.find(x=>x.id===id); if(e) return e; } }

$('#nav').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  st.tab=b.dataset.tab; render(); window.scrollTo(0,0);
});

$('#app').addEventListener('input', e=>{
  const t=e.target; if(!t.dataset.f) return;
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

  else if(act==='pick'){ st.w=b.dataset.w; render(); window.scrollTo(0,0); }

  else if(act==='chk'){
    const ex=exById(b.dataset.ex), s=db.drafts[st.w].sets[ex.id][+b.dataset.i];
    s.done=!s.done;
    if(s.done){ // um toque repete a última vez, se não digitou nada
      const last=lastOf(ex.id), ph=last&&last.sets[Math.min(+b.dataset.i,last.sets.length-1)];
      if(ph){ if(!s.kg && ph.kg && !ex.semCarga) s.kg=String(ph.kg); if(!s.reps && ph.reps) s.reps=String(ph.reps); }
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
    db.sessions.push({ id:String(Date.now()), date:today(), workout:st.w, sets });
    delete db.drafts[st.w]; save(); render(); window.scrollTo(0,0);
    toast('Treino salvo!');
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
      db={ sessions:[], body:[], drafts:{}, seeded:true }; save(); render(); toast('Dados apagados');
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
  if(e.target.id!=='imp') return;
  const file=e.target.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=()=>{ try{
      const d=JSON.parse(r.result);
      if(!d.sessions||!d.body) throw 0;
      db={ drafts:{}, seeded:true, ...d }; save(); render(); toast('Backup restaurado');
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
