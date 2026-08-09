# Backend

**Firebase.** Realtime Database para os dados, Authentication com Google para o login.
Um fornecedor só, nenhum servidor nosso para manter.

Decisão tomada por @jposawa. Descreve como usar, não é proposta em aberto.

---

## Modelagem

O Realtime Database é uma árvore JSON. Não tem tabela, não tem relação, não tem `JOIN`.
Regra prática: árvore rasa, dado duplicado quando ajudar a ler.

### A raiz é uma pasta por projeto

Uma instância costuma hospedar mais de um app, então **nada nosso fica na raiz**:

```
/
├── ...outros apps...
└── corrida-bode/
    ├── staging/          ← padrão
    └── production/
```

O nó do projeto vem de `APP_KEY` e o do ambiente de `VITE_DATABASE_TARGET_ENV`.
Quem monta o caminho é `buildDatabasePath()` — nenhum código escreve caminho à mão.

```js
buildDatabasePath("users", uid)
// → "corrida-bode/staging/users/abc123"
```

O padrão é `staging`: variável faltando grava no ramo de teste, não em produção.

### O que existe hoje

```
corrida-bode/{env}/
├── clientConfig/          ← editado à mão no Console
│   ├── isDebug
│   └── isRegistrationOpen
└── users/{uid}/
    ├── uid            ← repetido, ver abaixo
    ├── displayName
    ├── email
    ├── photoURL
    ├── createdAt      ← só no primeiro login
    ├── lastLoginAt
    └── appSettings/
        └── appTheme
```

### Planejado, ainda não gravado por nenhum código

```
corrida-bode/{env}/
├── clientConfig/
│   └── currentEditionId: "2026"          ← qual edição está valendo
│
├── raceEditions/{editionId}/             ← "2026", "2026-2"
│   ├── name, raceDate, location
│   ├── isRegistrationOpen
│   └── distances, shirtSizes, donationWeightKg
│
├── registrations/{editionId}/{registrationId}/
│   └── ...campos da inscrição, ver DOMAIN.md
│
├── registrationsByUser/{uid}/{editionId}: "{registrationId}"
│
└── admins/{uid}: true
```

**Inscrições aninhadas por edição.** A consulta principal da organização é "todos os inscritos
da edição X" — aninhado, é a leitura de uma subárvore. Achatado com `editionId` como campo,
seria ler tudo que já houve e filtrar no cliente.

**O índice usa `editionId` como chave, e guarda o `registrationId` como valor.** Duas coisas de
uma vez:

- `registrationsByUser/{uid}/{editionId}` responde "está inscrito nesta edição?" em uma leitura,
  sem varrer lista e sem permissão para ler inscrição alheia
- a chave sendo o `editionId` torna **impossível** haver duas inscrições da mesma pessoa na
  mesma edição. Não é validação, é a forma da árvore

Regras, quando chegar a hora:

```json
"raceEditions":       { ".read": true,  ".write": false },
"registrations": {
  "$editionId": {
    ".read": "<admin>",
    "$registrationId": {
      ".read": "auth != null && (data.child('userId').val() === auth.uid || <admin>)",
      ".write": "auth != null && ((!data.exists() && newData.child('userId').val() === auth.uid) || data.child('userId').val() === auth.uid || <admin>)",
      "paymentStatus":       { ".write": "<admin>" },
      "isDonationDelivered": { ".write": "<admin>" }
    }
  }
},
"registrationsByUser": {
  "$userId": {
    ".read":  "auth.uid === $userId || <admin>",
    ".write": "auth.uid === $userId"
  }
},
"admins": { ".read": false, ".write": false }
```

`<admin>` é abreviação de
`root.child('corrida-bode').child($targetEnv).child('admins').child(auth.uid).val() === true`.

`raceEditions` é público na leitura — a home mostra data e local antes de qualquer login — e
fechado na escrita: edição se cria pelo Console.

### O `uid` aparece duas vezes

No RTDB a chave existe só no caminho, nunca no valor. Um registro passado adiante como objeto
solto perderia a identidade — daí o campo repetido.

### Nó ausente é estado normal

Um nó só existe depois da primeira escrita: não dá para criar `users` vazio. Trocar de ambiente
deixa o ramo inteiro ausente até alguém gravar.

Ler caminho ausente **não dá erro** — devolve `val() === null`. Quem quebra é o código que
assume objeto (`snapshot.val().displayName`). Por isso ninguém chama o Firebase direto: tudo
passa por `services/databaseService.js`, e `readNode()` devolve `null`.

> Vale para nó ausente, **não** para `PERMISSION_DENIED`. Esse erro deve subir — significa regra
> errada ou não publicada.

### Preferências

`appSettings` vive no `localStorage` (vale sem login, lido de forma síncrona para o tema não
piscar) e em `users/{uid}/appSettings` (só com login, faz a escolha viajar entre aparelhos).

Leitura com `get`, uma vez por login — nunca `onValue`. Quando discordam: conta com tema salvo
ganha; conta sem nada recebe o valor local.

### Entrar e criar conta é a mesma escrita

O Google resolve a identidade. A única diferença é `createdAt`, definido só na primeira vez —
`updateNode` mescla campos em vez de substituir o nó.

### Campo opcional vazio

Não gravar `null` nem string vazia: no RTDB gravar `null` **apaga** a chave. Montar o objeto só
com o que foi preenchido.

---

## Login com Google

Popup, provider Google. Setup do SDK em [`src/lib/firebase.js`](../src/lib/firebase.js), e só ali.

Inscrição exige login: a pessoa consegue rever a própria inscrição, e a regra de segurança tem
`auth.uid` em que se apoiar. Custo: quem não tem conta Google depende da organização inscrever.

---

## `firebase/*` só em `lib/` e `services/`

Páginas, componentes e hooks chamam service e recebem dado pronto.

```js
const settings = await fetchUserAppSettings(uid)   // bom
const snap = await get(ref(firebaseDatabase, ...)) // ruim
```

---

## Segurança

As chaves do `.env` vão no bundle e são públicas. Isso é normal no Firebase — o que protege os
dados são as **Regras do Realtime Database**. Sem regra, o banco é aberto.

### Publicar

> ⚠️ O Console tem **um documento de regras para o banco inteiro**. Colar um `{ "rules": {...} }`
> completo substitui tudo, sem confirmação nem desfazer. Se a instância hospedar outro app, as
> regras dele somem junto. **Olhe o conteúdo atual antes.**

Regra para o que existe hoje:

```json
{
  "rules": {
    "corrida-bode": {
      "$targetEnv": {
        "clientConfig": {
          ".read": true,
          ".write": false
        },
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

`$targetEnv` é variável de caminho: casa com `staging` ou `production`, então o bloco vale para
os dois.

`clientConfig` é público na leitura — o app precisa dele antes de qualquer login — e
`".write": false` fecha para todo mundo: só muda pelo Console. É o que impede alguém fechar as
inscrições do app pela API.

As regras de `raceEditions`, `registrations` e `admins` estão esboçadas na seção "Planejado" e
entram quando essas telas existirem.

### Não usamos `.validate`

As regras cuidam de **quem lê e escreve o quê**. Nada de validação de formato.

`.validate` recusa a escrita **sem erro na tela** — o dado só não salva. Um campo novo esquecido
nas regras vira bug silencioso, e esse risco é maior que o de alguém forjar um valor inválido de
propósito. Se aparecer lixo de verdade, valida o campo que sujou — não antes.

`.read`/`.write` não é opcional: é o que impede uma pessoa de ler o telefone da outra.

### Antes de abrir ao público

1. Habilitar o provedor Google em Authentication → Sign-in method
2. Liberar o domínio de produção em Authentication → Settings → Authorized domains
3. Publicar as regras, sem apagar as de outros apps
4. Testar com uma segunda conta: regra errada não dá erro, só devolve dado a mais

---

## Nunca

- Chave de service account no front-end. Ela ignora todas as regras
- Confiar em validação de formulário como segurança. Quem quiser burlar chama a API direto
- Guardar CPF, dado de cartão ou comprovante com número de conta
