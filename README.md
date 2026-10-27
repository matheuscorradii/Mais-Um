# Mais Um

> Toda evolução começa com mais um.

App de registro de treino de musculação, feito para usar no celular durante o treino: anote cada série, veja a carga da última vez e acompanhe a evolução semana a semana. A ideia central é a do nome: sempre **mais uma** série, **mais uma** repetição, **mais um** quilo.

Funciona direto no navegador, sem cadastro, sem servidor e sem dependências. Os dados ficam no próprio aparelho.

---

## Funcionalidades

### Entrada
- Tela de abertura com a marca e um botão para cada perfil ("Entrar como Matheus", "Entrar como Thaís").
- Cada perfil tem plano, metas, visual e dados próprios.

### Hoje
- Saudação com a data ("Terça, 27 de outubro · Oi, Matheus").
- Faixa da semana (S T Q Q S S D): o dia de hoje fica destacado e um ponto marca os dias em que você treinou.
- Toque em qualquer dia para ver o treino marcado para ele.
- Card **Treino de hoje** com nome, quantidade de exercícios e séries, e o botão **Começar treino**.
- Dia sem treino: aviso "Não há treino neste dia" e o atalho **+ Criar novo treino** para aquele dia.
- **Matheus:** lista "Última vez" com séries, reps e carga de cada exercício.
- **Thaís:** recordes da semana, treinos feitos na semana (ex.: 2 de 3) e uma frase de incentivo.

### Registro do treino
- Um exercício por vez ("Peito · 1 de 7"), com a faixa **Última vez** e a meta (ex.: 3 × 8–10).
- Dica de progressão: quando você fecha o topo das reps em todas as séries, o app sugere subir a carga.
- Número grande de repetições com os botões **−1 · +1 · +5 · +10**, ou toque no número e digite.
- Carga com **− / +** de 2,5 kg, ou digitada.
- A carga já vem da série anterior (ou da última vez) e as reps repetem as da série anterior. É só ajustar se mudou.
- **Concluir série** sem contar nada repete as reps da última vez.
- As séries feitas aparecem em lista; tocar em uma reabre para corrigir.
- Botão de lista (☰) mostra todos os exercícios do dia com o andamento (0/3, 2/3, ✓), para fazer **fora de ordem** quando a academia está cheia.
- **+ série / − série** para ajustar o número de séries no dia.
- Mensagens de incentivo ao concluir série e ao finalizar ("Carga nova: 22,5 kg. Hoje foi +1!", "+1 rep que a última vez. Isso é o mais um!").

### Progresso
- Escolha o exercício e alterne entre **Carga** e **Repetições** (ou segundos, nos exercícios por tempo).
- Gráfico de barras das últimas 8 semanas, com a semana atual em amarelo e a evolução no período ("+10 kg em 8 semanas").
- Card **Novo recorde!** com o recorde mais recente.
- Treinos na semana e **semanas seguidas sem faltar**.
- Histórico completo do exercício.
- **Treinos registrados**: lista de todos os treinos feitos, com opção de excluir um treino específico.

### Corpo
- Registro de peso, gordura (%), massa muscular e gordura visceral.
- Peso e gordura atuais comparados com a meta do perfil.
- Histórico com a variação entre medições.

### Dados
- **Baixar backup (.json)** e **Restaurar backup**.
- Trocar de perfil.
- Apagar todos os dados do perfil.

### Editar o plano pelo app
- No registro, **Editar plano**: troque nome e dia do treino, nome do exercício, séries e reps mínimas/máximas.
- Suba exercícios na ordem, adicione, remova ou exclua o treino inteiro.
- **Voltar ao plano padrão** desfaz todas as edições.
- O histórico continua ligado a cada exercício mesmo depois de renomear.

---

## Como usar no celular

O app precisa estar publicado em um endereço **https://** (por exemplo, GitHub Pages).

1. Abra o endereço no Chrome (Android) ou no Safari (iPhone).
2. Escolha o perfil.
3. Instale na tela inicial:
   - **Android / Chrome:** menu ⋮ → **Instalar app**.
   - **iPhone / Safari:** compartilhar → **Adicionar à Tela de Início**.

Depois de instalado, ele abre em tela cheia, como um app, e funciona sem internet usando a última versão carregada.

Para abrir direto em um perfil, use `?perfil=matheus` ou `?perfil=thais` no fim do endereço.

---

## Seus dados

- Tudo fica no **armazenamento do navegador** (localStorage) do aparelho. Nada é enviado para nenhum servidor.
- Cada perfil tem seus dados separados.
- Dados de um aparelho **não aparecem** em outro. Para trocar de celular, baixe o backup em um e restaure no outro.
- Limpar os dados do navegador apaga os treinos. **Baixe o backup com frequência.**

### Formato do backup

O arquivo `mais-um-<perfil>-<data>.json` guarda:

```json
{
  "sessions": [
    { "id": "1793031851988", "date": "2026-10-26", "workout": "A",
      "sets": { "leg-press": [ { "kg": 50, "reps": 12 } ] } }
  ],
  "body":   [ { "date": "2026-10-26", "peso": 76.3, "gordura": 20.6 } ],
  "drafts": { },
  "plan":   { },
  "seeded": true
}
```

- `sessions`: treinos finalizados (exercício → lista de séries com kg e reps).
- `body`: medições do corpo.
- `drafts`: treino em andamento, ainda não finalizado.
- `plan`: só existe se o plano foi editado pelo app. Sem ele, vale o plano padrão do código.

Backups de versões anteriores (sem `plan`) continuam restaurando normalmente.

---

## Estrutura do projeto

```
index.html        página única do app
manifest.json     dados para instalar como app (nome, ícones, cores)
sw.js             service worker: abre sem internet
css/style.css     visual (cores da marca, telas, perfil da Thaís)
js/plan.js        plano padrão do Matheus
js/plan-thais.js  plano padrão da Thaís
js/perfis.js      perfis: nome, plano, metas, cores e avisos
js/app.js         telas, regras e armazenamento
img/              ícones do app (SVG e PNG 192/512)
```

### Editar o plano padrão pelo código

Em `js/plan.js` (ou `js/plan-thais.js`):

```js
A:{ nome:'Perna', dia:'Segunda · 12h', ex:[
  {id:'leg-press', n:'Leg press', s:3, r:[10,12]},
  {id:'prancha',   n:'Prancha',   s:2, r:[30,40], u:'s', semCarga:true},
]},
```

| Campo | Significado |
|---|---|
| `nome` | nome do treino |
| `dia` | dia da semana no começo do texto (`Segunda`, `Terça`…). Define em que dia o treino aparece na tela Hoje |
| `id` | identificador do exercício. **Não mude**: o histórico é ligado a ele |
| `n` | nome do exercício |
| `s` | número de séries |
| `r` | reps mínimas e máximas |
| `u` | `'s'` para segundos, `'min'` para minutos |
| `semCarga` | `true` para exercícios sem peso (prancha, abdominal) |

### Adicionar um perfil

Em `js/perfis.js`, copie um perfil existente, troque o nome, o plano e as metas. O botão "Entrar como…" aparece sozinho na tela de abertura.

---

## Rodar no computador

Não há build nem dependências. Na pasta do projeto:

```bash
python -m http.server 8765
```

Abra `http://localhost:8765`.

### Publicar uma versão nova

Os arquivos CSS e JS são carregados com `?v=N` no `index.html`. Ao publicar mudanças, aumente esse número para o celular não usar a versão antiga guardada.

---

## Identidade visual

| Cor | Hex | Uso |
|---|---|---|
| Violeta Mais | `#6C47FF` | marca, botões, destaques |
| Amarelo +1 | `#FFC82E` | conquistas, recordes, ação principal |
| Noite | `#16141F` | fundo do app |
| Grafite | `#2A2733` | cards no escuro |
| Lilás | `#E9E3FF` | fundos suaves |

- **Fontes:** Fredoka (títulos e números) e Nunito (textos), do Google Fonts.
- **Logo:** haltere com anilhas arredondadas, kettlebell com cantos suaves e o "+1" no centro.
- **Perfil Thaís:** versão clara em branco e lilás.
- **Tom de voz:** parceiro de treino, curto, animado e sem cobrança.

Os arquivos de design (`mais-um-identidade.zip`) ficam fora do repositório, pelo `.gitignore`.
