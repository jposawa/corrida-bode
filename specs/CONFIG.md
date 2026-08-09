# Configuração

## Regra de bolso

Se o valor muda **junto com um deploy** → variável de ambiente.
Se o valor muda **sem precisar de deploy** → dado no Realtime Database.

---

## Variáveis de ambiente (build)

Ficam no arquivo `.env` na raiz, e são lidas com `import.meta.env.VITE_*`.

```js
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
```

Três coisas que costumam pegar quem está começando:

**O prefixo `VITE_` é obrigatório.** O Vite só expõe ao navegador as variáveis que começam
assim. Sem o prefixo, o valor simplesmente chega `undefined`, sem erro nenhum.

**O valor é fixado no build.** O Vite substitui `import.meta.env.VITE_X` pelo texto literal na
hora de gerar o bundle. Mudar o `.env` depois do build não muda nada — precisa buildar de novo.

**Nada aqui é secreto.** Tudo que entra no `.env` acaba visível no código que vai para o
navegador. Chave de API do Firebase pode ir (é pública por design); senha, chave de service
account ou token de admin, nunca. Ver [`BACKEND.md`](BACKEND.md).

> Consequência prática: o scanner de segredos do Netlify barra o deploy ao achar esses valores
> dentro do `dist/`. A saída é declarar as chaves em `SECRETS_SCAN_OMIT_KEYS` — nunca desligar o
> scanner inteiro. Passo a passo no [README](../README.md).
>
> Se uma variável nova **não** puder aparecer no bundle, ela não pode ser `VITE_*`. Não existe
> meio-termo: o Vite inlina tudo que tem esse prefixo.

### `VITE_DATABASE_TARGET_ENV`

Diz em qual ramo do Realtime Database o app grava: `staging` ou `production`.

| Onde | Valor |
|------|-------|
| Sua máquina (`.env`) | `staging` |
| Deploy de teste no Netlify | `staging` |
| Deploy de produção | `production` |

O padrão, quando a variável falta, é `staging`. Isso é escolha de segurança: esquecer de
configurar faz o app escrever no ramo de teste, e não em cima dos dados reais.

Como é variável de build, **mudar o valor no Netlify exige um novo deploy** para ter efeito.

### Arquivos

| Arquivo | Vai para o Git? | Para que serve |
|---------|-----------------|----------------|
| `.env` | **Não** | Os valores reais, na sua máquina |
| `.env.example` | Sim | O modelo, com as chaves e sem os valores |

Ao acrescentar uma variável nova, adicionar em **ambos** — no `.env` com o valor, no
`.env.example` vazia. Quem clonar o repositório descobre o que precisa preencher pelo
`.env.example`; se ele ficar desatualizado, o app quebra sem explicar o porquê.

---

## Configuração em tempo de execução — `clientConfig`

Valor que precisa mudar **sem deploy** vai no Realtime Database, no nó
`corrida-bode/{env}/clientConfig`, editado à mão no Console do Firebase.

| Chave | Padrão | O que faz |
|-------|--------|-----------|
| `isDebug` | `false` | Liga logs de diagnóstico |
| `isRegistrationOpen` | `true` | Fecha as inscrições sem mexer no código |
| `currentEditionId` | — | Qual edição está valendo. Planejado, ver [`DOMAIN.md`](DOMAIN.md) |

Os padrões ficam em `BASE_CLIENT_CONFIG` (`constants/settings.js`) e valem enquanto o banco não
responde ou quando o nó ainda não existe. O que vem do banco é mesclado por cima.

```js
const { isDebug, isRegistrationOpen } = useClientConfig()
```

Carregado uma vez pelo `useClientConfigSync`, chamado só no `App.jsx`. Leitura com `get`, sem
subscrição — mudança de config vale no próximo carregamento da página.

**Só hook e componente leem config.** Um helper é função pura e não pode alcançar o atom nem o
service (ver [`STANDARDS.md`](STANDARDS.md)). Se um helper precisa de comportamento condicional,
quem chama passa o valor — ou o log vive na camada de cima.
