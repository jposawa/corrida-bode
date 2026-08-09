# Estrutura do projeto

Todo código-fonte fica em `src/`.

O alias `@/` aponta para `src/` (configurado em `vite.config.js` e `jsconfig.json`), então
`import { CustomButton } from "@/components"` funciona de qualquer arquivo.

```
src/
  components/     ← peças de UI reutilizáveis
  fragments/      ← opcional (ver abaixo)
  pages/          ← telas ligadas a uma rota
  hooks/          ← hooks React reutilizáveis
  services/       ← acesso ao Firebase
  helpers/        ← funções puras
  globalState/    ← atoms do Recoil
  constants/      ← valores fixos
  lib/            ← setup de SDKs de terceiros
  styles/         ← CSS global
```

Nem toda pasta existe ainda. Criar quando houver o que colocar dentro — pasta vazia é ruído.

---

## O que vai em cada pasta

### `components/`

Peças de UI reutilizáveis. Principalmente visuais, mas podem ter estado próprio simples
(um input controlado que gerencia seu aberto/fechado, por exemplo).

A regra: se a lógica se resolve sozinha ali dentro e não vaza regra de negócio para fora,
é componente.

Uma pasta por componente:

```
components/
  CustomButton/
    CustomButton.jsx
    CustomButton.module.css
    index.js          ← exporta só CustomButton
  CustomInput/
    ...
  index.js            ← exporta todos os componentes
```

### `fragments/` *(opcional)*

Seções de UI compostas, com contexto de negócio claro. Juntam vários componentes, têm estado
complexo, ou representam um pedaço com significado próprio da página
(ex.: `RegistrationForm`, `RegistrationStatusCard`).

**Diferença para `components/`:**

- `components/` → bloco de construção genérico, serve em qualquer lugar
- `fragments/` → sabe do negócio, específico de contexto, não é para sair usando em qualquer tela

**Como decidir (orientação, não regra rígida):** se o elemento importa de `@/globalState`
*e* orquestra um fluxo (envio de formulário, sequência de passos), tende a fragment. Um
componente pequeno que lê um atom para um fim isolado — um seletor de tema, por exemplo —
continua sendo componente. A pergunta é se o elemento *conduz um fluxo* ou apenas *reage a
um estado*.

Mesma estrutura de pastas de `components/`.

### `pages/`

Componentes de rota, ligados ao `react-router-dom`. Cada página corresponde a uma rota.
Páginas compõem fragments e componentes, e cuidam da busca de dados no nível da rota.

Uma pasta por página, cada uma com seu `index.js`:

```
pages/
  Home/
    Home.jsx
    Home.module.css
    index.js
  Registration/
    Registration.jsx
    Registration.module.css
    index.js
```

Existe uma rota curinga `*` no fim do `AppRouter`, apontando para a página `NotFound`.
Ela é obrigatória por causa do `public/_redirects`: no Netlify **qualquer** caminho entrega o
`index.html`, então quem trata endereço inválido é o react-router, não o servidor. Sem ela, um
endereço errado mostraria tela em branco.

#### O elemento raiz da página

Cada página cuida do próprio layout. O elemento raiz de toda página é `<main>` — ele é ao mesmo
tempo o marco semântico e o container de layout. Sem div extra em volta.

```jsx
// Bom — <main> é marco semântico e container
export const Registration = () => (
  <main className={styles.page}>
    <h1>Inscrição</h1>
    ...
  </main>
)

// Ruim — wrapper redundante
export const Registration = () => (
  <div className={styles.page}>
    <h1>Inscrição</h1>
    ...
  </div>
)
```

O `App.jsx` **não** deve renderizar `<main>` — ele monta a casca do app (menu, container de
scroll) com uma `<div>` comum. HTML permite só um `<main>` visível por documento, e o roteamento
SPA respeita isso naturalmente, já que só uma página é renderizada por vez.


### `hooks/`

Hooks React customizados. Nomeados `useXxx`. Cada hook concentra lógica de estado/efeito/ciclo
de vida que é reaproveitada e não pertence a um componente só.

Só exports nomeados — nada de `export default`.

```
hooks/
  useAppSettings.js      ← lê e altera preferências (tema)
  useAppSettingsSync.js  ← puxa as preferências da conta no login
  useAuth.js             ← lê o estado de login, expõe entrar/sair
  useAuthListener.js     ← registra o observador do Firebase
  index.js               ← re-exporta tudo: export * from "./useXxx"
```

> **`useAuthListener` e `useAppSettingsSync` são chamados uma única vez, no `App.jsx`.** Cada
> chamada registra algo global — um observador no Firebase, uma leitura de preferências por
> login. Repetidos em várias telas, viram observadores duplicados e leituras redundantes.
>
> `useAuth` e `useAppSettings` só leem estado e expõem ações. Não registram nada, e podem ser
> usados em quantas telas quiser.

### `services/`

Entrada e saída de dados — tudo que fala com o Firebase. Arquivos nomeados pelo domínio.
Podem ter efeito colateral; aqui isso é esperado.

Esta é a **única** pasta (junto com `lib/`) que pode importar de `firebase/*`.
Ver [`BACKEND.md`](BACKEND.md).

```
services/
  databaseService.js   ← leitura/escrita genérica, trata nó ausente
  authService.js       ← login com Google
  userService.js       ← cadastro em users/{uid}
  index.js
```

`databaseService` é a base dos outros: nenhum service fala com o Firebase por fora dele, para
que o tratamento de "nó que não existe" fique num lugar só. Ver [`BACKEND.md`](BACKEND.md).

### `helpers/`

Funções puras e reutilizáveis. Arquivos nomeados pelo contexto. Sem efeito colateral.
Se a função chama uma API ou usa React, ela pertence a `services/` ou `hooks/`.

Só exports nomeados.

```
helpers/
  conversions.js
  date.js
  index.js     ← re-exporta tudo: export * from "./nomeDoArquivo"
```

### `globalState/`

Só atoms do Recoil. Nada de lógica.

A chave de todo atom passa por `withPrefix()` (de `helpers/conversions.js`), que prefixa com o
`APP_KEY`. Chave de atom no Recoil é global e precisa ser única — o prefixo evita colisão.

```
globalState/
  general.js
  registration.js
  index.js     ← re-exporta tudo
```

### `constants/`

Valores fixos do app. Arquivos nomeados pelo contexto. Só valores — nada de cálculo.

Só exports nomeados.

```
constants/
  navigation.jsx
  registration.js
  index.js     ← re-exporta tudo
```

### `lib/`

Setup de SDKs de terceiros e instâncias de cliente. Um arquivo por fornecedor. Só configuração
e instanciação — nada de lógica de app, nada de regra de domínio. Quem *usa* o cliente mora em
`services/`.

**Sem `index.js` aqui.** Os imports são explícitos (`@/lib/firebase`) justamente para que a
dependência do fornecedor fique visível no ponto onde é usada.

```
lib/
  firebase.js    ← initializeApp + auth + database
```

### `styles/`

Só CSS global — tokens, registros `@property`, reset. Nada de `.module.css` aqui; esses ficam
ao lado do componente. Ver [`STYLING.md`](STYLING.md).

---

## Padrão de barrel export

Toda pasta expõe um `index.js` que re-exporta o conteúdo. Nada de import profundo vindo de fora
da pasta.

```js
// Bom
import { CustomButton } from "@/components"
import { capitalize } from "@/helpers"

// Ruim
import { CustomButton } from "@/components/CustomButton/CustomButton"
```

O `index.js` da pasta de um componente exporta só o próprio componente:

```js
// components/CustomButton/index.js
export { CustomButton } from "./CustomButton"
```

**Por que barrel:** o caminho do import não muda quando o arquivo de dentro é renomeado ou
movido. Quem importa depende da pasta, não da organização interna dela.
