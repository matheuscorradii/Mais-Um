# Mais Um

> Toda evolução começa com mais um.

App de registro de treino de musculação, feito para usar no celular durante o treino: anote cada série, veja a carga da última vez e acompanhe a evolução semana a semana. A ideia central é a do nome: sempre **mais uma** série, **mais uma** repetição, **mais um** quilo.

Funciona direto no navegador, sem cadastro, sem servidor e sem dependências. Os dados ficam no próprio aparelho.

---

## Funcionalidades

### Primeira abertura
- Cada pessoa usa o app no próprio celular. Na primeira vez, digita o nome e já cai no editor para montar o próprio treino, começando em branco.
- **Já tenho backup**: restaura um backup e entra direto com os treinos, o plano e o nome dele.
- Ninguém vê o treino de outra pessoa: tudo fica só no aparelho.

### Hoje
- Saudação com a data ("Sexta, 6 de novembro · Oi, Ana").
- Faixa da semana (S T Q Q S S D): um ponto marca os dias em que você treinou. Tocar em outro dia mostra o que foi feito nele (exercícios e séries). Treino só começa no dia de hoje.
- O dia é livre: **Vamos treinar hoje?** lista todos os treinos, com o que já foi feito na semana (✓), a última vez de cada um e o **Próximo** sugerido.
- Escolher um treino que você já fez esta semana mostra "Você já treinou … esta semana", com **Ok** (treinar mesmo assim) e **Trocar de treino**.
- Treino começado e não finalizado aparece como **Continuar treino**.
- **+ Criar novo treino**.
- Recordes da semana e treinos feitos na semana (ex.: 2 de 3).
- Lembrete quando passa de 14 dias sem backup.

### Registro do treino
- Contador de séries feitas com barra de progresso no topo.
- O treino inteiro em uma tela só: todos os exercícios com suas séries, para fazer na ordem que quiser.
- Cada exercício mostra a meta (ex.: 3 × 8–10) e o que você fez na última vez.
- Dica de progressão: quando você fecha o topo das reps em todas as séries, o app sugere subir a carga.
- Cada série tem carga, reps e um **✓**. Os campos sugerem o valor da série anterior ou da última vez; um toque no ✓ confirma a sugestão.
- Tocar no ✓ de novo reabre a série.
- **Obs.** em cada exercício: fica guardada e aparece nos próximos treinos.
- **Editar** em cada exercício e **+ exercício** mudam o plano na hora, sem sair do treino.
- **+ série / − série** para ajustar o número de séries no dia.
- Mensagens de incentivo ao concluir série e ao finalizar ("Carga nova: 22,5 kg. Hoje foi +1!", "+1 rep que a última vez. Isso é o mais um!").

### Progresso
- Escolha o exercício e alterne entre **Carga** e **Repetições** (ou segundos, nos exercícios por tempo).
- Gráfico de barras das últimas 8 semanas, com a semana atual em lavanda e a evolução no período ("+10 kg em 8 semanas").
- Card **Novo recorde!** com o recorde mais recente.
- Treinos na semana e **semanas seguidas sem faltar**.
- Histórico completo do exercício.
- **Treinos registrados**: lista de todos os treinos feitos, com opção de excluir um treino específico.

### Corpo
- Registro de peso, gordura (%), massa muscular e gordura visceral.
- Peso e gordura atuais comparados com as suas metas (definidas em Dados).
- Histórico com a variação entre medições.

### Dados
- **Baixar backup (.json)** e **Restaurar backup**.
- Data do último backup e dica para instalar o app.
- Seu nome e suas metas de peso e gordura.
- Apagar todos os dados: o app volta para a primeira abertura.

### Editar o plano pelo app
- No registro, **Editar plano**: troque o nome do treino, nome do exercício, séries e reps mínimas/máximas.
- Suba exercícios na ordem, adicione, remova ou exclua o treino inteiro.
- O histórico continua ligado a cada exercício mesmo depois de renomear.

---

## Como usar no celular

O app precisa estar publicado em um endereço **https://** (por exemplo, GitHub Pages).

1. Abra o endereço no Chrome (Android) ou no Safari (iPhone).
2. Digite seu nome e escolha o plano inicial.
3. Instale na tela inicial:
   - **Android / Chrome:** menu ⋮ → **Instalar app**.
   - **iPhone / Safari:** compartilhar → **Adicionar à Tela de Início**.

Depois de instalado, ele abre em tela cheia, como um app, e funciona sem internet usando a última versão carregada.


---

## Seus dados

- Tudo fica no **armazenamento do navegador** (localStorage) do aparelho. Nada é enviado para nenhum servidor.
- Cada celular tem um perfil, com dados só dele. Ninguém vê o treino do outro.
- **iPhone:** instale na tela inicial. Sem isso, o Safari pode apagar os dados de um site que fica cerca de 7 dias sem ser aberto.
- Dados de um aparelho **não aparecem** em outro. Para trocar de celular, baixe o backup em um e restaure no outro.
- Limpar os dados do navegador apaga os treinos. **Baixe o backup com frequência.**

### Formato do backup

O arquivo `mais-um-<nome>-<data>.json` guarda:

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
- `notes`: observações de cada exercício.
- `perfil`: nome e metas.
- `plan`: o plano de treino da pessoa.
- `backup`: data do último backup.

Backups de versões anteriores (sem `plan`) continuam restaurando normalmente.

---

## Estrutura do projeto

```
index.html        página única do app
manifest.json     dados para instalar como app (nome, ícones, cores)
sw.js             service worker: abre sem internet
css/style.css     visual (cores da marca e telas)
js/plan.js        plano antigo do Matheus (só para migrar)
js/plan-thais.js  plano antigo da Thaís (só para migrar)
js/perfis.js      plano inicial em branco e migração dos perfis antigos
js/app.js         telas, regras e armazenamento
img/              ícones do app (SVG e PNG 192/512)
```

### Formato do plano

Cada pessoa monta o plano pelo app. No backup, ele fica em `plan`:

```js
A:{ nome:'Perna', ex:[
  {id:'leg-press', n:'Leg press', s:3, r:[10,12]},
  {id:'prancha',   n:'Prancha',   s:2, r:[30,40], u:'s', semCarga:true},
]},
```

| Campo | Significado |
|---|---|
| `nome` | nome do treino |
| `id` | identificador do exercício. **Não mude**: o histórico é ligado a ele |
| `n` | nome do exercício |
| `s` | número de séries |
| `r` | reps mínimas e máximas |
| `u` | `'s'` para segundos, `'min'` para minutos |
| `semCarga` | `true` para exercícios sem peso (prancha, abdominal) |

---|---|
| `nome` | nome do treino |
| `id` | identificador do exercício. **Não mude**: o histórico é ligado a ele |
| `n` | nome do exercício |
| `s` | número de séries |
| `r` | reps mínimas e máximas |
| `u` | `'s'` para segundos, `'min'` para minutos |
| `semCarga` | `true` para exercícios sem peso (prancha, abdominal) |


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
| Violeta Mais | `#5A2DCC` | marca, botões, destaques |
| Lavanda +1 | `#B9A3F5` | conquistas, recordes, série concluída |
| Noite | `#2E1A6B` | textos |
| Branco | `#FFFFFF` | fundo do app, cards |
| Lilás | `#F1ECFF` / `#EEE8FB` | fundos suaves, barra de navegação |

- **Fonte:** Nunito (títulos em peso forte, textos em regular), do Google Fonts.
- **Logo:** haltere com anilhas arredondadas, kettlebell com cantos suaves e o "+1" no centro.
- **Perfis:** o visual é o mesmo para todos, em base branca.
- **Tom de voz:** parceiro de treino, curto, animado e sem cobrança.

Os arquivos de design (`mais-um-identidade.zip`) ficam fora do repositório, pelo `.gitignore`.
