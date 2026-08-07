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

```
/
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

```json
{
  "rules": {
    "registrations": {
      ".read": "root.child('admins').child(auth.uid).val() === true",

      "$registrationId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('admins').child(auth.uid).val() === true)",

        ".write": "auth != null && (
          (!data.exists() && newData.child('userId').val() === auth.uid) ||
          data.child('userId').val() === auth.uid ||
          root.child('admins').child(auth.uid).val() === true
        )",

        "paymentStatus": {
          ".write": "root.child('admins').child(auth.uid).val() === true"
        },
        "isDonationDelivered": {
          ".write": "root.child('admins').child(auth.uid).val() === true"
        },

        ".validate": "newData.hasChildren(['fullName', 'phone', 'city', 'shirtSize', 'distance', 'userId'])",

        "shirtSize": { ".validate": "newData.val().matches(/^(P|M|G|GG)$/)" },
        "distance":  { ".validate": "newData.val() === 3 || newData.val() === 5 || newData.val() === 10" },
        "userId":    { ".validate": "newData.val() === auth.uid || root.child('admins').child(auth.uid).val() === true" }
      }
    },

    "registrationsByUser": {
      "$userId": {
        ".read": "auth.uid === $userId || root.child('admins').child(auth.uid).val() === true",
        ".write": "auth.uid === $userId"
      }
    },

    "admins": {
      ".read": false,
      ".write": false
    },

    "eventInfo": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).val() === true"
    }
  }
}
```

### O que cada decisão está segurando

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

**`.validate` em `shirtSize` e `distance`.** Validação no formulário existe para ajudar quem
preenche; ela não protege nada, porque a requisição pode ser feita fora do app. Ver
[`DOMAIN.md`](DOMAIN.md).

### Antes de abrir para o público

1. **Publicar as regras.** Um banco novo nasce em modo de teste, que **expira e vira acesso
   negado** — ou, pior, começa aberto. Conferir no Console qual dos dois está valendo.
2. **Testar com uma segunda conta Google.** Regra errada não dá erro: só devolve mais dado do
   que devia. Entrar com outra conta e confirmar que ela não vê a inscrição da primeira.
3. **Cadastrar os admins à mão.** Console → Realtime Database → criar `admins/{uid}: true`.
   O UID aparece no Console → Authentication → Users.
4. **Autorizar o domínio de produção.** Console → Authentication → Settings → Authorized
   domains. Sem isso o login funciona em `localhost` e falha em produção.

---

## O que não fazer

**Nunca colocar uma chave de service account no front-end.** Ela ignora todas as regras.
Chave de service account é coisa de servidor — e este projeto não tem servidor.

**Nunca confiar em validação de formulário como segurança.** O formulário é conveniência para
quem preenche. Quem quiser burlar chama a API direto. O que vale é o `.validate`.

**Nunca guardar dado sensível aqui.** Sem CPF, sem dado de cartão, sem comprovante de
pagamento com número de conta. O app registra que o pagamento foi aprovado, não como.
