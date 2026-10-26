/* ============================================================
   PLANO DO MATHEUS — edite aqui para mudar exercícios/séries/reps
   s = séries, r = [reps mínimo, reps máximo], u = 's' para tempo
   semCarga = true quando não usa kg (ex.: prancha)
   ============================================================ */
const PLAN_MATHEUS = {
  A:{ nome:'Perna', dia:'Segunda · 12h', ex:[
    {id:'leg-press',  n:'Leg press',                     s:3, r:[10,12]},
    {id:'agach',      n:'Agachamento goblet / smith',    s:3, r:[10,10]},
    {id:'extensora',  n:'Cadeira extensora',             s:3, r:[12,12]},
    {id:'flexora',    n:'Mesa flexora',                  s:3, r:[12,12]},
    {id:'stiff',      n:'Stiff com halteres',            s:3, r:[10,12]},
    {id:'pantu',      n:'Panturrilha em pé',             s:3, r:[15,15]},
    {id:'prancha',    n:'Prancha',                       s:2, r:[30,40], u:'s', semCarga:true},
  ]},
  B:{ nome:'Peito', dia:'Quarta · 6h', ex:[
    {id:'sup-reto',   n:'Supino reto com halteres',      s:3, r:[8,10]},
    {id:'sup-incl',   n:'Supino inclinado com halteres', s:3, r:[10,10]},
    {id:'peck',       n:'Crucifixo na máquina (peck deck)', s:3, r:[12,12]},
    {id:'desenv',     n:'Desenvolvimento com halteres',  s:3, r:[10,10]},
    {id:'elev-lat',   n:'Elevação lateral',              s:3, r:[12,15]},
    {id:'triceps',    n:'Tríceps na corda',              s:3, r:[12,12]},
    {id:'abd-infra',  n:'Abdominal infra',               s:2, r:[15,15], semCarga:true},
  ]},
  C:{ nome:'Costas', dia:'Sexta · 6h', ex:[
    {id:'puxada',     n:'Puxada frontal',                s:3, r:[8,10]},
    {id:'remada-b',   n:'Remada baixa (triângulo)',      s:3, r:[10,10]},
    {id:'remada-u',   n:'Remada unilateral com halter',  s:3, r:[10,10]},
    {id:'face-pull',  n:'Face pull / crucifixo inverso', s:3, r:[12,15]},
    {id:'rosca',      n:'Rosca direta',                  s:3, r:[10,12]},
    {id:'martelo',    n:'Rosca martelo',                 s:2, r:[12,12]},
    {id:'abd-polia',  n:'Abdominal na polia / prancha lateral', s:2, r:[12,12]},
  ]},
};
