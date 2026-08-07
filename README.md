# Corrida do Bode

App de inscrições para a corrida. O participante se inscreve informando seus dados,
escolhe a distância e o tamanho da camisa, e a organização acompanha as inscrições.

A descrição original da ideia está em [IDEIA.md](IDEIA.md).
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
  components/    componentes de UI reutilizáveis
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

## Antes de escrever código

Leia os arquivos em [specs/](specs/). Eles são a fonte da verdade do projeto:

- [DOMAIN.md](specs/DOMAIN.md) — o que o app faz e como os dados são modelados
- [STANDARDS.md](specs/STANDARDS.md) — padrões de código
- [STRUCTURE.md](specs/STRUCTURE.md) — estrutura de pastas
- [STYLING.md](specs/STYLING.md) — tokens de CSS, tema, responsividade
- [BACKEND.md](specs/BACKEND.md) — Firebase, modelagem no Realtime Database, regras de segurança
- [CONFIG.md](specs/CONFIG.md) — variáveis de ambiente
