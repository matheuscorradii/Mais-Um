/* ============================================================
   PLANO DA THAÍS — edite aqui para mudar exercícios/séries/reps
   s = séries, r = [reps mínimo, reps máximo]
   semCarga = true quando não usa kg; u = unidade ('s' ou 'min')
   ============================================================ */
const PLAN_THAIS = {
  A:{ nome:'Anterior e glúteos', dia:'Segunda', ex:[
    {id:'extensora',  n:'Cadeira extensora',            s:4, r:[12,15]},
    {id:'leg-press',  n:'Leg press 45° ou horizontal',  s:4, r:[10,12]},
    {id:'sissy-hack', n:'Agachamento sissy ou hack',    s:3, r:[12,12]},
    {id:'abdutora',   n:'Cadeira abdutora',             s:4, r:[12,15]},
    {id:'pelvica',    n:'Elevação pélvica na máquina',  s:3, r:[10,12]},
    {id:'gemeos',     n:'Gêmeos sentado',               s:4, r:[15,15]},
    {id:'bike-a',     n:'Bike sentada',                 s:1, r:[15,20], u:'min', semCarga:true},
  ]},
  B:{ nome:'Superiores e tronco', dia:'Quarta', ex:[
    {id:'puxada',     n:'Puxada frontal (pulley)',      s:3, r:[12,12]},
    {id:'remada',     n:'Remada baixa sentada',         s:3, r:[12,12]},
    {id:'supino',     n:'Supino máquina ou halteres',   s:3, r:[12,12]},
    {id:'desenv',     n:'Desenvolvimento sentada',      s:3, r:[12,12]},
    {id:'rosca',      n:'Rosca bíceps cabo/halteres',   s:3, r:[12,12]},
    {id:'triceps',    n:'Tríceps pulley',               s:3, r:[12,15]},
    {id:'bike-b',     n:'Bike sentada',                 s:1, r:[15,20], u:'min', semCarga:true},
  ]},
  C:{ nome:'Posterior e glúteos', dia:'Sexta', ex:[
    {id:'flexora',    n:'Cadeira flexora',              s:4, r:[12,15]},
    {id:'mesa-flex',  n:'Mesa flexora',                 s:3, r:[12,12]},
    {id:'passada',    n:'Passada / afundo',             s:3, r:[10,12]},
    {id:'adutora',    n:'Cadeira adutora',              s:4, r:[12,15]},
    {id:'gluteo',     n:'Glúteo na polia ou máquina',   s:3, r:[12,12]},
    {id:'pantu-leg',  n:'Panturrilha no leg press',     s:4, r:[15,15]},
    {id:'bike-c',     n:'Bike sentada',                 s:1, r:[15,20], u:'min', semCarga:true},
  ]},
};
