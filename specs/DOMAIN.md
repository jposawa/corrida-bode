# Domínio

## O produto

App de inscrição para a **Corrida do Bode**. Duas pessoas usam o app, com necessidades opostas:

- **Participante** — se inscreve, escolhe distância e camisa, e depois quer conferir se sua
  inscrição foi confirmada.
- **Organização** — vê a lista de inscritos, confirma pagamento e entrega da doação, e precisa
  saber quantas camisas de cada tamanho encomendar.

**Este arquivo é a fonte da verdade do domínio.** A descrição solta que originou o projeto foi
absorvida aqui e não existe mais no repositório — o que não estiver escrito neste documento não
está decidido.

---

## A regra que define tudo

> Só corre quem tem **pagamento aprovado** *e* **doação entregue**.

São duas condições independentes, confirmadas em momentos diferentes:

| Condição | Quando acontece | Quem confirma |
|----------|-----------------|---------------|
| Pagamento (Pix ou cartão) | Na inscrição ou depois | Organização, conferindo o comprovante |
| Doação (2 kg de alimentos) | No dia da corrida, no local | Organização, recebendo em mãos |

Por isso **não existe um campo único `confirmada`**. São dois estados separados, e o
"está apto a correr" é derivado dos dois. Juntar num campo só faz perder a informação de
*qual* das duas está faltando — que é exatamente o que a organização precisa saber para cobrar.

---

## Entidades

### `Registration` — a inscrição

O centro do app. Uma pessoa, uma inscrição.

**Campos obrigatórios** (sem eles não existe inscrição):

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | string | Gerado pelo Firebase |
| `fullName` | string | Nome completo |
| `phone` | string | Guardar **só os dígitos** — a máscara é coisa da UI |
| `city` | string | Cidade |
| `shirtSize` | `ShirtSize` | `P` \| `M` \| `G` \| `GG` |
| `distance` | `RaceDistance` | `3` \| `5` \| `10` (km) |

**Campos opcionais** (a pessoa pode deixar em branco):

| Campo | Tipo | Observação |
|-------|------|------------|
| `heightCm` | number | Altura em centímetros |
| `weightKg` | number | Peso em quilos |
| `age` | number | Idade |
| `gender` | `Gender` | `male` \| `female` \| `other` \| `unspecified` |
| `email` | string | |

**Campos de controle** (a organização preenche, o participante nunca):

| Campo | Tipo | Observação |
|-------|------|------------|
| `paymentMethod` | `PaymentMethod` | `pix` \| `card` |
| `paymentStatus` | `PaymentStatus` | `pending` \| `approved` \| `rejected` |
| `isDonationDelivered` | boolean | Os 2 kg de alimentos foram entregues |
| `userId` | string | UID do Google de quem se inscreveu |
| `createdAt` | number | Timestamp em milissegundos |
| `updatedAt` | number | Timestamp em milissegundos |

**Opcional significa opcional de verdade.** Altura, peso, idade, sexo e e-mail nunca podem
bloquear o envio do formulário nem virar validação obrigatória disfarçada. Se um deles
passar a ser necessário para alguma coisa, isso muda o modelo — e é uma conversa, não um ajuste.

**Guardar o telefone só com dígitos.** `"11987654321"`, nunca `"(11) 98765-4321"`. Formato é
apresentação: formata na hora de exibir, e limpa na hora de gravar. Guardar formatado
significa que buscar por telefone falha quando alguém digita de outro jeito.

**A distância é número, não texto.** `5`, não `"5km"`. Assim dá para ordenar e filtrar sem
gambiarra de parsing. O `"km"` entra na hora de mostrar.

**Só a organização escreve os campos de controle.** Isso não é convenção de código, é regra
de segurança — se o cliente pudesse gravar `paymentStatus`, qualquer pessoa se aprovaria
sozinha. Ver as regras do Realtime Database em [`BACKEND.md`](BACKEND.md).

### `User` — a pessoa logada

A identidade vem do Firebase Authentication (login com Google) — não guardamos senha, e não
existe tela de cadastro nem de edição de perfil.

O que o app **guarda** é um espelho do perfil, em `users/{uid}`:

| Campo | Observação |
|-------|------------|
| `uid` | Chave do registro **e** campo dentro dele |
| `displayName` | Vem do Google. Pode não existir |
| `email` | Vem do Google |
| `photoURL` | Vem do Google. Pode não existir |
| `createdAt` | Definido só no primeiro login |
| `lastLoginAt` | Atualizado a cada login explícito |

**Entrar e criar conta são a mesma operação.** O Google resolve quem a pessoa é; do lado do app
os dois casos gravam o mesmo registro, e a única diferença é o `createdAt`, que não é
sobrescrito depois da primeira vez.

**O `uid` aparece duas vezes de propósito.** No Realtime Database a chave existe só no caminho,
nunca no valor — um registro passado adiante como objeto solto perderia a identidade. A regra de
segurança valida que os dois batem. Detalhe em [`BACKEND.md`](BACKEND.md).

**A pessoa logada não é a inscrição.** Espelhar o perfil não muda isso. O login serve para
*ligar* uma inscrição a uma pessoa (e para ela poder rever a sua), não para preencher o
formulário. O nome da inscrição é digitado pelo participante — pode ser diferente do nome da
conta Google, e alguém pode inscrever um familiar da própria conta.

### `Admin` — quem organiza

Não é um campo do usuário nem algo que o app escreve. É uma lista de UIDs mantida à mão no
Console do Firebase.

Isso é proposital: ser admin é uma decisão de segurança, e uma lista editável só pelo Console
não pode ser alterada por nenhum código do app, nem por acidente nem de propósito.

### `EventInfo` — informações do evento

Endereço, data, horário de largada, como funciona o dia. Um único registro, escrito pela
organização e lido por todo mundo.

O conteúdo real ainda não foi definido — só se sabe que vai existir. Modelar como texto livre
por enquanto, e só criar campos separados quando as informações existirem de fato. Inventar
estrutura antes de ter o conteúdo é decidir errado com confiança.

---

## Estados derivados

Não guardar no banco o que dá para calcular. Estes são funções em `helpers/`, não campos:

```js
// Está apto a correr?
const isCleared = registration.paymentStatus === "approved" && registration.isDonationDelivered

// O que falta?
// → pagamento, doação, ou os dois
```

**Por que não guardar `isCleared`:** um campo derivado precisa ser atualizado toda vez que uma
das duas fontes muda. Uma atualização esquecida gera um dado que se contradiz — e aí não dá
para saber qual dos campos está certo. Calcular na hora nunca desincroniza.

---

## Regras transversais

**Nunca apagar inscrição.** Se alguém desistir, marcar `paymentStatus` como `rejected`. A
organização precisa do histórico para acertar contas e conferir camisas encomendadas.

**Camisa e distância são listas fechadas.** `P/M/G/GG` e `3/5/10` — a UI oferece só essas
opções e o banco valida só essas. Campo livre aqui vira `"g"`, `"G "`, `"Gê"` na planilha final.

**Toda inscrição carrega `userId`.** É por ele que a regra de segurança decide quem pode ler e
editar o quê. Sem ele, a inscrição fica órfã: ninguém consegue acessar, nem o dono.

**Datas são timestamps numéricos.** `Date.now()`. O Realtime Database não tem tipo de data, e
número ordena certo sem depender de fuso ou formato de string.

---

## Ordem de entrega

| Etapa | Escopo |
|-------|--------|
| 1 | Login com Google + cadastro em `users` ✅ · formulário de inscrição (falta gravar) · "minha inscrição" |
| 2 | Painel da organização — lista de inscritos, confirmar pagamento e doação |
| 3 | Página de informações do evento |
| 4 | Resumo para a organização: total por tamanho de camisa e por distância |

A etapa 1 já grava os campos de controle (com `paymentStatus: "pending"` e
`isDonationDelivered: false`), mesmo sem tela para editá-los. O formato dos dados é a parte
cara de mudar depois; a tela de admin é barata.

---

## Pagamento: fora do escopo do app

O app **não processa pagamento**. Não integra com Pix, não abre checkout, não fala com gateway.

O que ele faz: registra qual forma a pessoa escolheu (`paymentMethod`) e se a organização já
confirmou o recebimento (`paymentStatus`). O dinheiro trafega fora do app — chave Pix,
maquininha, o que a organização já usa.

Processar pagamento de verdade traz responsabilidade sobre dados financeiros, exige backend
próprio (chave secreta de gateway nunca pode ir para o navegador) e não é o problema que este
app resolve. Se um dia virar requisito, é um projeto à parte — não um campo novo.

---

## Nomes

Código em inglês (`Registration`, `shirtSize`, `fetchRegistrationsByUserId`).
Textos de UI em pt-br ("Inscrição", "Tamanho da camisa", "Pagamento pendente").
Ver [`STANDARDS.md`](STANDARDS.md).
