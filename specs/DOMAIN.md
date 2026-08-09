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

### `RaceEdition` — a edição da corrida

> **Planejado, não implementado.** Está aqui porque a decisão precisa ser tomada **antes** da
> primeira inscrição ser gravada — ver "Por que decidir isso agora" no fim desta seção.

A corrida se repete. Cada realização é uma edição, e é dela que penduram as inscrições.

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | string | Legível, não gerado: `"2026"`, `"2026-2"`. Aparece na URL e no caminho do banco |
| `name` | string | `"Corrida do Bode 2026"` |
| `raceDate` | number | Timestamp do dia da corrida |
| `location` | string | Endereço. Texto livre até existir motivo para separar |
| `isRegistrationOpen` | boolean | Fecha inscrição sem mexer em código |
| `distances` | number[] | Distâncias **desta** edição |
| `shirtSizes` | string[] | Tamanhos **desta** edição |
| `donationWeightKg` | number | Quilos de alimento exigidos |
| `priceInfo` | string | Texto sobre valor e forma de pagamento. O app não cobra |

**Distâncias, tamanhos e peso da doação são dados da edição, não constantes do código.** Hoje
eles estão fixos em `constants/registration.js` — o que só funciona enquanto existe uma corrida
só. Uma edição que ofereça 21 km, ou peça 3 kg, exigiria deploy. Quando `RaceEdition` entrar,
essas listas saem de `constants/` e passam a ser lidas da edição.

**Qual edição está valendo** vem de `clientConfig.currentEditionId`, não de "a mais recente".
Ordenar por data e pegar a última chuta errado no intervalo entre uma edição e outra, e impede
publicar a próxima edição antes de encerrar a atual.

### `Registration` — a inscrição

Uma pessoa, uma edição. Pertence a uma `RaceEdition` — não existe inscrição solta.

**Campos obrigatórios** (sem eles não existe inscrição):

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | string | Gerado pelo Firebase |
| `editionId` | string | A qual edição pertence |
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

**Uma inscrição por pessoa por edição.** A mesma pessoa se inscreve todo ano, e cada inscrição é
independente: em 2026 ela pode correr 5 km, em 2027 10 km. O que **não** pode é duas inscrições
na mesma edição. Isso é garantido pela forma do índice, não por checagem no código — ver
`registrationsByUser` em [`BACKEND.md`](BACKEND.md).

**"Estou inscrito nesta edição?" é uma leitura direta**, não uma busca. O app lê
`registrationsByUser/{uid}/{editionId}`: veio algo, está inscrito; veio nulo, não está. Sem
varrer lista, e sem precisar de permissão para ler inscrição de terceiro.

#### Por que decidir isso agora

Nada de `registrations` foi gravado ainda. Acrescentar `editionId` e aninhar por edição agora
custa **zero**: é editar spec.

Depois da primeira inscrição real, o mesmo passo vira migração de dado em produção — reescrever
todo registro, reconstruir o índice e trocar as regras, com gente já inscrita. É o tipo de campo
que não se acrescenta "depois".

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
| `appSettings` | Preferências. Hoje só `appTheme` (`light` \| `dark`) |

**Preferência não exige login.** `appSettings` espelha o que já está no `localStorage`; sem
conta, a escolha continua valendo, só não viaja para outro aparelho. Ver
[`BACKEND.md`](BACKEND.md).

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

### ~~`EventInfo`~~ — absorvido pela `RaceEdition`

Havia uma entidade separada para endereço, data e "como funciona o dia". Ela deixou de fazer
sentido quando as edições entraram: essas informações **mudam a cada edição**, então pertencem à
edição.

Um `EventInfo` global ao lado de `RaceEdition` seria endereço em dois lugares — e um deles
ficaria desatualizado.

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

**Camisa e distância são listas fechadas.** A UI oferece só as opções da edição. Campo livre
aqui vira `"g"`, `"G "`, `"Gê"` na planilha final. Hoje as listas estão em `constants/`; passam a
vir da `RaceEdition` quando ela existir.

**Toda inscrição carrega `userId`.** É por ele que a regra de segurança decide quem pode ler e
editar o quê. Sem ele, a inscrição fica órfã: ninguém consegue acessar, nem o dono.

**Datas são timestamps numéricos.** `Date.now()`. O Realtime Database não tem tipo de data, e
número ordena certo sem depender de fuso ou formato de string.

---

## Ordem de entrega

| Etapa | Escopo |
|-------|--------|
| 1 | Login com Google + cadastro em `users` ✅ |
| 2 | `RaceEdition` — criar a edição no Console, ler dela as distâncias, tamanhos e datas |
| 3 | Gravar a inscrição (já com `editionId`) + índice `registrationsByUser` + "minha inscrição" |
| 4 | Painel da organização — lista de inscritos da edição, confirmar pagamento e doação |
| 5 | Resumo: total por tamanho de camisa e por distância |

**A edição vem antes de gravar inscrição.** Não porque a tela dela seja urgente — ela nem
precisa de tela, dá para criar o registro à mão no Console. É porque a inscrição precisa nascer
com `editionId` e no caminho certo. Inverter a ordem significa migrar dado de gente já inscrita.

A etapa 3 já grava os campos de controle (`paymentStatus: "pending"`,
`isDonationDelivered: false`) mesmo sem tela para editá-los. Formato de dado é caro de mudar
depois; tela de admin é barata.

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
