# Corrida do Bode

App de inscrições para a corrida. O participante se inscreve informando seus dados,
escolhe a distância e o tamanho da camisa, e a organização acompanha as inscrições.

As regras de domínio, padrões de código e decisões técnicas estão na pasta [specs/](specs/).

---

## Stack

| Camada | Escolha |
|--------|---------|
| Build | Vite |
| UI | React 18 (JavaScript, sem TypeScript) |
| Rotas | react-router-dom |
| Estado global | Recoil |
| Estilos | CSS Modules + variáveis CSS |
| Backend | Firebase Realtime Database |
| Login | Firebase Authentication (Google) |

Sem framework de CSS (nada de Tailwind/Bootstrap) — ver [specs/STYLING.md](specs/STYLING.md).

---

## Rodando o projeto

Pré-requisito: [Node.js](https://nodejs.org/) 20+ e [pnpm](https://pnpm.io/).

**1. Instale as dependências**

```bash
pnpm install
```

**2. Crie o arquivo `.env`**

Copie o modelo e preencha com os dados do projeto no Firebase:

```bash
cp .env.example .env
```

Os valores ficam no Console do Firebase → *Configurações do projeto* → *Seus apps* → *Configuração do SDK*.

> O `.env` **não** vai para o Git (está no `.gitignore`). O `.env.example` vai, mas sem valores.

**3. Suba o servidor de desenvolvimento**

```bash
pnpm dev
```

O app abre em `http://localhost:5173`. A flag `--host` já está no script, então dá para
abrir pelo celular na mesma rede usando o IP que o Vite imprime no terminal.

---

## Scripts

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento com hot reload |
| `pnpm build` | Gera o build de produção em `dist/` |
| `pnpm preview` | Serve o `dist/` localmente, para conferir o build |
| `pnpm lint` | Roda o ESLint |

---

## Organização das pastas

```
src/
  components/    peças de UI reutilizáveis e genéricas
  fragments/     seções compostas que sabem do negócio (ex.: RegistrationForm)
  pages/         telas ligadas a uma rota
  hooks/         hooks React reutilizáveis (useXxx)
  services/      acesso ao Firebase (leitura/escrita de dados)
  helpers/       funções puras, sem efeito colateral
  globalState/   atoms do Recoil
  constants/     valores fixos do app
  lib/           setup de SDKs de terceiros (Firebase)
```

O detalhamento — o que pode e o que não pode morar em cada pasta — está em
[specs/STRUCTURE.md](specs/STRUCTURE.md).

O alias `@/` aponta para `src/`, então `import { CustomButton } from "@/components"`
funciona de qualquer arquivo.

---

## Deploy no Netlify

**As configurações de build ficam no painel do Netlify**, não em arquivo. Comando `pnpm build`,
pasta de publicação `dist`.

> Não existe `netlify.toml` neste projeto de propósito. Se ele existisse, **sobrescreveria** o
> que está configurado no painel — e aí a config visível na interface viraria decoração, sem
> nenhum aviso. Uma fonte de verdade só.

### As variáveis de ambiente precisam ser cadastradas no painel

O `.env` **não** vai para o Git, então o Netlify não tem como adivinhar os valores.
Cadastrar em *Site configuration → Environment variables*:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_DATABASE_TARGET_ENV
```

Sem elas o build passa normalmente e o app quebra ao abrir — as variáveis são lidas no
momento do build, não em tempo de execução.

### O scanner de segredos do Netlify barra o build

Sintoma: o deploy falha com aviso de segredo exposto no `dist/`.

Causa: o Vite **inlina** as `VITE_*` dentro do bundle. O scanner do Netlify procura os valores
das variáveis do painel dentro dos arquivos gerados, encontra, e interrompe o deploy.

O scanner está certo em princípio — ele existe justamente para pegar uma chave secreta que
vazou para o build. O que ele não sabe é que **a configuração web do Firebase é pública por
projeto**: ela vai para o navegador de qualquer forma, e o que protege os dados são as Regras de
Segurança do Realtime Database, não o sigilo dessas chaves.

Solução — cadastrar mais uma variável no painel, listando as chaves que podem aparecer no
bundle:

```
SECRETS_SCAN_OMIT_KEYS
```

Valor (uma linha, separado por vírgula, sem espaços):

```
VITE_FIREBASE_API_KEY,VITE_FIREBASE_AUTH_DOMAIN,VITE_FIREBASE_DATABASE_URL,VITE_FIREBASE_PROJECT_ID,VITE_FIREBASE_STORAGE_BUCKET,VITE_FIREBASE_MESSAGING_SENDER_ID,VITE_FIREBASE_APP_ID,VITE_FIREBASE_MEASUREMENT_ID,VITE_DATABASE_TARGET_ENV
```

> **Não usar `SECRETS_SCAN_ENABLED=false`.** Isso desliga a verificação inteira, e aí o dia em
> que alguém cadastrar uma chave de service account por engano o deploy passa sem reclamar.
> `SECRETS_SCAN_OMIT_KEYS` dispensa **só** as chaves listadas; qualquer variável nova continua
> sendo vigiada.
>
> A regra para decidir se uma chave nova entra nessa lista: ela pode ser lida por qualquer
> pessoa que abrir o navegador? Se sim, ela nunca deveria ter sido secreta. Se não, ela não pode
> estar num `VITE_*` — ver [CONFIG.md](specs/CONFIG.md).

### Rotas que não são a raiz — `public/_redirects` é obrigatório

O arquivo [public/_redirects](public/_redirects) manda qualquer caminho para o `index.html`
com status 200. Sem ele, abrir `/inscricao` direto (ou dar F5 nessa página) daria 404, porque
o Netlify procuraria um arquivo com esse nome no servidor.

**Isto não é configurável pelo painel de build** — é um arquivo que precisa existir em
`public/` para ser copiado para o `dist/`. Não apagar.

### Depois do primeiro deploy

Liberar o domínio do Netlify no Firebase: Console → Authentication → Settings →
*Authorized domains*. Sem isso o login com Google funciona em `localhost` e falha em produção.

---

## Antes de escrever código

Leia os arquivos em [specs/](specs/). Eles são a fonte da verdade do projeto:

- [DOMAIN.md](specs/DOMAIN.md) — o que o app faz e como os dados são modelados
- [STANDARDS.md](specs/STANDARDS.md) — padrões de código
- [STRUCTURE.md](specs/STRUCTURE.md) — estrutura de pastas
- [STYLING.md](specs/STYLING.md) — tokens de CSS, tema, responsividade
- [BACKEND.md](specs/BACKEND.md) — Firebase, modelagem no Realtime Database, regras de segurança
- [CONFIG.md](specs/CONFIG.md) — variáveis de ambiente
