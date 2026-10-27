/* ============================================================
   PERFIS — cada pessoa tem plano, metas, visual e dados próprios.
   Os dados ficam separados no navegador de cada aparelho.
   Para abrir direto num perfil: adicione ?perfil=thais ao endereço.
   ============================================================ */
const PERFIS = {
  matheus:{
    nome:'Matheus', resumo:'Perna · Peito · Costas', cor:'#6C47FF', themeColor:'#16141F',
    plan:PLAN_MATHEUS,
    meta:{ peso:73, gordura:17, til:'~' },
    seedBody:{ date:'2026-10-26', peso:76.3, gordura:20.6, musculo:57.8, visceral:8 },
    dicaInicio:'Semanas 1–2: cargas leves, 2 séries por exercício se estiver pesado, sempre sobrando ~3 repetições. É a fase de readaptar.',
  },
  thais:{
    nome:'Thaís', resumo:'Objetivo 65 kg · Fortalecimento', cor:'#C9B8FF', themeColor:'#FFFFFF',
    plan:PLAN_THAIS,
    meta:{ peso:65 },
    hojeResumo:true, // tela Hoje com recordes e semana (protótipo da Thaís) em vez de "Última vez"
    aviso:'Foco: fortalecimento e lombar protegida. Exercícios sempre apoiados nas máquinas! Beba de 2,2 a 2,5 L de água por dia.',
  },
};
