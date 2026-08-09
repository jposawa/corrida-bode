# Backend

**Firebase.** Realtime Database para os dados, Authentication com Google para o login.
Um fornecedor só, nenhum servidor nosso para manter.

Decisão tomada por @jposawa. O que está aqui descreve como usar, não é proposta em aberto.

---

## Por que Realtime Database

O app é pequeno e o modelo é raso: uma lista de inscrições, um registro de informações do
evento, uma lista de admins. Não há relação complexa entre entidades — cada inscrição é
independente das outras.

Para esse formato, o Realtime Database entrega o que precisamos sem nada a mais para aprender:
escrita e leitura direto do navegador, sincronização em tempo real de graça (o painel da
organização atualiza sozinho quando alguém se inscreve) e regras de segurança em JSON.

Firestore seria a outra opção do Firebase. Tem consultas melhores, mas o custo de aprender
`collection`/`doc`/`query`/`where` não se paga num app que basicamente lista tudo e filtra na
memória. Se um dia a lista crescer a ponto de não caber na tela sem paginação, aí a conversa
muda.

---

## Modelagem dos dados

O Realtime Database é **uma árvore JSON gigante**. Não tem tabela, não tem relação, não tem
`JOIN`. A regra prática: **árvore rasa, dados duplicados quando ajudar a ler**.

### A raiz é uma pasta por projeto

**Nada deste app fica na raiz do banco.** Tudo pende de um nó com o nome do projeto:

```
/
├── ...outros apps, se houver...
└── corrida-bode/     ← o nosso
    ├── staging/
    └── production/
```

O motivo é que **uma instância de Realtime Database costuma hospedar mais de um app**. Um nó
`staging/` solto na raiz seria ambíguo (staging de qual projeto?) e colidiria com qualquer outro
app que escolhesse o mesmo nome — os dois passariam a escrever na mesma árvore sem perceber.

O nó vem de `APP_KEY`, e `buildDatabasePath()` o coloca sempre. Não é opcional nem esquecível.

> Isto vale mesmo quando o banco parece exclusivo hoje. O custo de manter o prefixo é zero; o
> custo de descobrir depois que ele faltava é migrar dado em produção.

### Dentro do nosso nó

O segundo nível é o **ambiente**, vindo de `VITE_DATABASE_TARGET_ENV`. Staging e produção
convivem em ramos independentes — dá para testar à vontade sem sujar os dados reais, e sem
precisar de um segundo projeto no Firebase.

```
corrida-bode/
├── staging/          ← ramo de teste (padrão)
└── production/       ← ramo real
    │
    │  Os dois têm exatamente a mesma forma:
    │
├── users/
│   └── {uid}/
│       ├── uid: "abc123..."          ← repetido de propósito, ver abaixo
│       ├── displayName: "Maria Silva"
│       ├── email: "maria@..."
│       ├── photoURL: "https://..."
│       ├── createdAt: 1754524800000  ← só no primeiro login
│       ├── lastLoginAt: 1754524800000
│       └── appSettings/
│           └── appTheme: "dark"      ← preferências, lidas uma vez no login
│
├── registrations/
│   └── {registrationId}/
│       ├── fullName: "Maria Silva"
│       ├── phone: "11987654321"
│       ├── city: "São Paulo"
│       ├── shirtSize: "M"
│       ├── distance: 5
│       ├── heightCm: 165          ← opcionais só existem se preenchidos
│       ├── email: "maria@..."
│       ├── paymentMethod: "pix"
│       ├── paymentStatus: "pending"
│       ├── isDonationDelivered: false
│       ├── userId: "abc123..."
│       ├── createdAt: 1754524800000
│       └── updatedAt: 1754524800000
│
├── registrationsByUser/
│   └── {userId}/
│       └── {registrationId}: true    ← índice: as inscrições de uma pessoa
│
├── admins/
│   └── {userId}: true                ← editado à mão no Console
│
└── eventInfo/
    ├── content: "..."
    └── updatedAt: 1754524800000
```

Nenhum código monta esse caminho na mão. Quem monta é `buildDatabasePath()`
(`src/helpers/database.js`), que já coloca o prefixo do ambiente:

```js
buildDatabasePath("registrations", registrationId)
// → "corrida-bode/staging/registrations/abc123"
```

O padrão do ambiente é `staging` de propósito. Se a variável faltar no build, o app grava no
ramo de teste — o contrário, cair em produção por esquecimento, é o erro que não dá para
desfazer.

### Nó que não existe é o estado normal, não um erro

O Realtime Database **não tem tabela**. Um nó passa a existir quando alguém grava algo nele —
não dá para criar `users` vazio e deixar esperando. Consequência direta: ao trocar
`VITE_DATABASE_TARGET_ENV` de `staging` para `production`, **todo o ramo está ausente** até a
primeira escrita.

Ler um caminho ausente **não dá erro**. O Firebase devolve um snapshot com `exists() === false`
e `val() === null`. Quem quebra é o código que assume que veio objeto:

```js
// Quebra com "Cannot read properties of null" num ramo vazio
const nome = snapshot.val().displayName
```

Por isso **nenhuma tela chama o Firebase direto**. Tudo passa por
`src/services/databaseService.js`, que já resolve o caso ausente:

| Função | Nó ausente devolve |
|--------|--------------------|
| `readNode(...)` | `null` |
| `readNodeAsList(...)` | `[]` — nunca `null`, então dá `.map()` direto |
| `nodeExists(...)` | `false` |
| `updateNode(...)` | cria o caminho inteiro na escrita |

A regra fica num lugar só, em vez de depender de cada chamada lembrar de checar.

> **Isso vale para nó ausente, não para permissão negada.** Se a regra de segurança recusar a
> leitura, o Firebase lança `PERMISSION_DENIED` — e esse erro **deve** subir, porque significa
> regra errada ou não publicada. Engolir os dois casos juntos esconderia exatamente o defeito
> que mais custa caro.

### Por que o `uid` aparece duas vezes

Em `users/{uid}`, o `uid` é a chave **e** um campo dentro do registro.

No Realtime Database a chave existe só no caminho, nunca no valor. Ao ler uma coleção, o retorno
é `{ abc: {...}, def: {...} }` — se o código pegar só os valores, ou passar um item adiante como
objeto solto, a identidade fica para trás. Com o campo repetido, o registro se basta sozinho.

A regra de segurança valida que o campo bate com a chave (`newData.val() === $userId`), então a
duplicação não pode divergir. Sem essa validação, duplicar dado seria criar duas fontes de
verdade — que é justamente o que não se quer.

### Preferências: dois lugares, leitura única

`appSettings` vive em dois lugares ao mesmo tempo:

| Onde | Quando vale | Por quê |
|------|-------------|---------|
| `localStorage` | sempre, inclusive sem login | é lido de forma síncrona ao abrir a página, então o tema não pisca |
| `users/{uid}/appSettings` | só com login | faz a preferência acompanhar a pessoa em outro aparelho |

**A leitura do banco é `get`, uma vez por login — nunca `onValue`.** Uma subscrição mantém
conexão aberta e re-renderiza a cada mudança; para preferência que a própria pessoa altera na
tela em que está, isso é custo sem contrapartida.

Quando os dois discordam:

- **conta tem tema salvo** → o da conta vence, e sobrescreve o local
- **conta não tem** (primeiro login) → o tema local sobe para a conta

A conta ganhar é o que serve para quem entra num aparelho novo. Semear com o valor local é o que
evita perder a escolha de quem ajustou o tema antes de entrar.

### Login e criação de conta são a mesma escrita

Não existe fluxo separado de "criar conta". O Google resolve a identidade; do lado do app os
dois casos gravam o mesmo registro. A única diferença é `createdAt`, definido apenas quando
ainda não havia nada — `updateNode` mescla campos em vez de substituir o nó, então nada se perde.

A escrita acontece no **login explícito**, não no observador de estado. O observador também
dispara a cada recarga de página com sessão em cache, o que geraria uma escrita no banco a cada
F5 sem nenhum ganho.

### Por que `registrationsByUser` existe

Sem ele, achar as inscrições de alguém significa **ler todas as inscrições** e filtrar. Isso
funciona com 10 inscritos e quebra com 500 — e, pior, a regra de segurança teria que liberar a
leitura da lista inteira para qualquer pessoa logada, expondo os dados de todo mundo.

Com o índice, a pessoa lê só `registrationsByUser/{seuUid}` e depois busca cada inscrição pelo
id. Lê exatamente o que é dela.

**Duplicar dado assim é o normal no Realtime Database, não uma gambiarra.** O preço é ter que
escrever nos dois lugares ao mesmo tempo — o que se resolve com uma escrita atômica:

```js
// Um update() com caminhos absolutos grava tudo ou nada.
// Se falhar no meio, nada é gravado — nunca sobra índice apontando para inscrição inexistente.
const updates = {
  [`registrations/${registrationId}`]: registration,
  [`registrationsByUser/${userId}/${registrationId}`]: true,
}

await update(ref(firebaseDatabase), updates)
```

### Campos opcionais que não foram preenchidos

**Não gravar `null` nem string vazia — simplesmente não gravar a chave.** No Realtime Database,
gravar `null` num campo é o mesmo que apagá-lo, então `{ age: null }` e "sem `age`" viram a
mesma coisa no banco. Montar o objeto só com o que foi preenchido evita confusão na leitura.

---

## Login com Google

Firebase Authentication, provider Google, via popup.

O setup do SDK está em [`src/lib/firebase.js`](../src/lib/firebase.js) — e **só ali**.

### Toda inscrição exige login

O participante precisa entrar com a conta Google antes de se inscrever.

Isso resolve três coisas de uma vez: a pessoa consegue voltar depois e ver o status da própria
inscrição; a regra de segurança tem em quem se apoiar (`auth.uid`); e ninguém consegue inflar a
lista com inscrições falsas em massa.

O custo é real e vale registrar: **quem não tem conta Google não consegue se inscrever
sozinho**. Se isso virar problema no dia, a saída é a organização inscrever a pessoa pelo
painel — não afrouxar a regra de segurança.

---

## Regra de ouro do acesso ao Firebase

**`firebase/*` só é importado dentro de `src/lib/` e `src/services/`.**

Páginas, componentes e hooks chamam funções de service e recebem dados prontos. Nunca falam
com o Firebase direto.

```js
// Bom — a página não sabe que existe Firebase
const registrations = await fetchRegistrationsByUserId(userId)

// Ruim — o fornecedor vazando para dentro da tela
const snapshot = await get(ref(firebaseDatabase, "registrations"))
```

Não é purismo. É o que faz um erro de leitura ter um lugar só para procurar, e o que permite
mudar de backend mexendo em uma pasta em vez de vinte arquivos.

---

## Segurança: as regras são a única proteção

As chaves do `.env` **vão no bundle e são públicas** — qualquer pessoa consegue lê-las abrindo
o navegador. Isso é normal e esperado no Firebase, não é vazamento.

O que protege os dados são as **Regras de Segurança do Realtime Database**. Sem regra, o banco
é aberto: qualquer pessoa lê e escreve tudo, com as chaves que estão no seu próprio site.

### Regras propostas

Vão no Console do Firebase → Realtime Database → Regras.

> ## ⚠️ Conferir o que já existe antes de colar
>
> O Console tem **um único documento de regras para o banco inteiro**. Colar um
> `{ "rules": { ... } }` completo **substitui tudo** — sem confirmação, sem aviso, sem desfazer.
>
> Se a instância hospedar outros apps, as regras deles somem junto, e eles ficam ou totalmente
> abertos, ou totalmente travados. **Abra o Console e olhe o conteúdo atual antes de qualquer
> coisa.**
>
> O bloco abaixo é um **pedaço**: a chave `corrida-bode` entra dentro do `"rules"` que já existe,
> ao lado do que estiver lá. Se não houver nada além do padrão, aí sim ele pode ser o documento
> inteiro — bastando remover a linha `"COMENTARIO"`.

Tudo fica sob `$targetEnv`, uma **variável de caminho**: casa com o nome do ramo (`staging` ou
`production`) e fica disponível dentro das regras. O bloco é escrito uma vez e vale para os dois.

### O que publicar hoje

Só `users` existe no código. Regra para o que existe, não para o que está planejado:

```json
{
  "rules": {
    "corrida-bode": {
      "$targetEnv": {
        "users": {
          "$userId": {
            ".read": "auth.uid === $userId",
            ".write": "auth.uid === $userId"
          }
        }
      }
    }
  }
}
```

`.read` e `.write` são a fechadura — sem eles o banco é público. Não há substituto: validação de
formulário não protege nada, porque quem quiser burlar chama a API direto.

### Quando o formulário passar a gravar

Aí entram `registrations`, `registrationsByUser`, `admins` e `eventInfo`:

```json
{
  "rules": {

    "COMENTARIO": "as chaves dos outros projetos continuam aqui, intactas",

    "corrida-bode": {
      "$targetEnv": {

        "users": {
          "$userId": {
            ".read": "auth.uid === $userId || root.child('corrida-bode').child($targetEnv).child('admins').child(auth.uid).val() === true",
            ".write": "auth.uid === $userId"
          }
        },

        "registrations": {
          ".read": "root.child('corrida-bode').child($targetEnv).child('admins').child(auth.uid).val() === true",

          "$registrationId": {
            ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('corrida-bode').child($targetEnv).child('admins').child(auth.uid).val() === true)",

            ".write": "auth != null && ((!data.exists() && newData.child('userId').val() === auth.uid) || data.child('userId').val() === auth.uid || root.child('corrida-bode').child($targetEnv).child('admins').child(auth.uid).val() === true)",

            "paymentStatus": {
              ".write": "root.child('corrida-bode').child($targetEnv).child('admins').child(auth.uid).val() === true"
            },
            "isDonationDelivered": {
              ".write": "root.child('corrida-bode').child($targetEnv).child('admins').child(auth.uid).val() === true"
            }
          }
        },

        "registrationsByUser": {
          "$userId": {
            ".read": "auth.uid === $userId || root.child('corrida-bode').child($targetEnv).child('admins').child(auth.uid).val() === true",
            ".write": "auth.uid === $userId"
          }
        },

        "admins": {
          ".read": false,
          ".write": false
        },

        "eventInfo": {
          ".read": true,
          ".write": "root.child('corrida-bode').child($targetEnv).child('admins').child(auth.uid).val() === true"
        }
      }
    }
  }
}
```

> O nome `corrida-bode` aparece escrito à mão dentro de cada `root.child(...)`. As regras do
> Realtime Database são JSON puro — não existe variável nem função para reaproveitar. Se o
> `APP_KEY` mudar, **todas** essas ocorrências mudam junto, e o app para de ler o que grava.

### Não usamos `.validate`

As regras cuidam de **quem pode ler e escrever o quê**, e só disso. Nenhum `.validate` de
formato.

O motivo é o custo assimétrico: `.validate` recusa a escrita **sem erro na tela** — o dado
simplesmente não salva. Um campo novo esquecido nas regras vira um bug silencioso que só aparece
quando alguém repara que a preferência não persistiu. Para um app deste tamanho, esse risco é
maior que o de alguém forjar um `shirtSize` inválido de propósito.

Se um dia aparecer lixo de verdade no banco, aí sim vale acrescentar validação no campo
específico que sujou — não antes.

**O que não é opcional é `.read` / `.write`.** É o que impede uma pessoa de ler o telefone da
outra. Validação de formulário não substitui isso: quem quiser burlar chama a API direto, sem
passar pela tela.

### O que cada decisão está segurando

**Cada pessoa só escreve o próprio `users/{uid}`.** `auth.uid === $userId` amarra a escrita à
chave, então ninguém sobrescreve o registro de outro.

**Ler `/registrations` inteiro só admin.** A permissão de ler a lista completa e a de ler uma
inscrição específica são separadas de propósito. Participante lê a dele; organização lê todas.

**`paymentStatus` e `isDonationDelivered` têm regra própria, mais restrita.** As regras do
Realtime Database são **hierárquicas e permissivas**: um `.write` que libera no nível de cima
libera tudo abaixo, e regras filhas *não conseguem* tirar essa permissão. Por isso o `.write`
do `$registrationId` **não pode** ser um `true` genérico — ele já é restrito, e os filhos
apertam mais ainda dentro do que sobrou.

> Este é o ponto mais fácil de errar do arquivo inteiro. Se um dia alguém afrouxar o `.write`
> de cima "só para testar", os campos de controle ficam abertos junto — e o app fica com
> autoaprovação de pagamento sem nenhum erro aparecer.

**`admins` com `.read: false`.** Ninguém lê a lista pelo app. As regras conseguem consultá-la
mesmo assim (`root.child(...)` roda no servidor, fora das regras de leitura), então a
verificação funciona sem expor quem são os organizadores.

### Antes de abrir para o público

1. **Publicar as regras — sem apagar as dos outros projetos.** Copiar o documento atual do
   Console, acrescentar a chave `corrida-bode` e salvar o conjunto. Ver o aviso acima.
2. **Testar com uma segunda conta Google.** Regra errada não dá erro: só devolve mais dado do
   que devia. Entrar com outra conta e confirmar que ela não vê a inscrição da primeira.
3. **Cadastrar os admins à mão, nos dois ambientes.** Console → Realtime Database → criar
   `corrida-bode/staging/admins/{uid}: true` **e** `corrida-bode/production/admins/{uid}: true`.
   São ramos independentes: ser admin no staging não dá nenhum poder em produção. O UID aparece
   no Console → Authentication → Users.
4. **Autorizar o domínio de produção.** Console → Authentication → Settings → Authorized
   domains. Sem isso o login funciona em `localhost` e falha em produção.

---

## O que não fazer

**Nunca colocar uma chave de service account no front-end.** Ela ignora todas as regras.
Chave de service account é coisa de servidor — e este projeto não tem servidor.

**Nunca confiar em validação de formulário como segurança.** O formulário é conveniência para
quem preenche. Quem quiser burlar chama a API direto. O que vale é o `.read` / `.write`.

**Nunca guardar dado sensível aqui.** Sem CPF, sem dado de cartão, sem comprovante de
pagamento com número de conta. O app registra que o pagamento foi aprovado, não como.
