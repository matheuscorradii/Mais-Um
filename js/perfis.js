/* ============================================================
   PLANO INICIAL — quem abre o app pela primeira vez começa com um
   treino em branco e monta o seu. O plano fica só no aparelho dela.
   ============================================================ */
const PLANO_INICIAL = { A:{ nome:'Treino A', ex:[{id:'ex-1', n:'Novo exercício', s:3, r:[10,12]}] } };

/* LEGADO — só para os dois aparelhos que já usavam a versão com perfis fixos:
   os dados antigos ganham nome, metas e plano daqui. Nunca aparece para quem é novo. */
const LEGADO = {
  matheus:{ nome:'Matheus', plan:PLAN_MATHEUS, meta:{ peso:73, gordura:17, til:'~' },
    dicaInicio:'Semanas 1–2: cargas leves, 2 séries por exercício se estiver pesado, sempre sobrando ~3 repetições. É a fase de readaptar.' },
  thais:{ nome:'Thaís', plan:PLAN_THAIS, meta:{ peso:65 },
    aviso:'Foco: fortalecimento e lombar protegida. Exercícios sempre apoiados nas máquinas! Beba de 2,2 a 2,5 L de água por dia.' },
};
