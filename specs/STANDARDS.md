# Padrões de código

## Idioma

Código (variáveis, funções, arquivos, constantes) → **inglês**.
Conteúdo de UI (rótulos, mensagens, placeholders, títulos) → **pt-br**.
Comentários → **pt-br**.

O projeto é escrito com alguém aprendendo React. Comentário explicando *por que* algo é assim
é bem-vindo; comentário repetindo o que o código já diz é ruído.

---

## Responsabilidade

Cada código mora onde sua responsabilidade pertence. A estrutura define o contexto —
os padrões fazem valer.

| Camada | Responsável por |
|--------|-----------------|
| `components/` | Renderizar UI, lógica isolada que se resolve sozinha |
| `fragments/` | UI que sabe do negócio, orquestração de fluxo |
| `pages/` | Composição da rota, busca de dados de topo |
| `services/` | Chamadas ao Firebase, I/O externo |
| `helpers/` | Transformações puras, sem efeito colateral |
| `hooks/` | Lógica React reutilizável (ciclo de vida, estado, efeitos) |
| `globalState/` | Só definição de atoms — sem lógica |
| `constants/` | Só valores fixos — sem cálculo |
| `lib/` | Só setup de SDK de terceiros — sem lógica de app |
| `styles/` | Só tokens de CSS global |

Não misturar camadas. Um helper não chama um service. Um componente não define atom.

---

## Nomes

Nomes precisam ser intuitivos e descritivos. Nada de variável de uma letra fora de índice de
laço. Nada de nome vago (`data`, `info`, `temp`, `handler`). Vale em todo lugar — funções
auxiliares, callbacks, handlers de evento.

```js
// Ruim
const handleClick = (e) => { ... }
const d = await fetchData()
const fn = (x) => x * 2

// Bom
const handleRegistrationFormSubmit = (event) => { ... }
const registration = await fetchRegistrationById(registrationId)
const toKilometers = (meters) => meters / 1000
```

Handlers de evento: `handle` + substantivo + verbo → `handleFormSubmit`, `handleModalClose`,
`handleShirtSizeChange`.

Booleanos: prefixo `is`, `has`, `can`, `should` → `isLoading`, `hasErrors`, `canSubmit`.

---

## Funções

Padrão: arrow functions.

```js
const formatPhone = (phone) => { ... }

const RaceBadge = ({ label }) => (
  <span>{label}</span>
)
```

Usar `function` só quando houver ganho claro:
- Precisa de hoisting
- É recursiva e se referenciar pelo nome ajuda a ler
- O nome no stack trace importa para depurar (raro)

---

## Simplicidade

Escrever código que se lê como lógica direta. Nada de one-liner esperto que precisa ser
decifrado. Nada de abstração criada antes da hora.

```js
// Ruim — acumulador e chave opacos
const result = items.reduce((acc, x) => ({ ...acc, [x.id]: x }), {})

// OK — reduce com nomes descritivos
const registrationsById = registrations.reduce((registrationMap, registration) => ({
  ...registrationMap,
  [registration.id]: registration,
}), {})

// Também serve — laço simples, quando o reduce não acrescenta clareza
const registrationsById = {}
for (const registration of registrations) {
  registrationsById[registration.id] = registration
}
```

`.reduce` é permitido. Se usar, o acumulador e o item precisam ser nomeados pelo que
representam — nunca `acc`/`x` ou `prev`/`cur`.

Se uma função precisa de comentário para explicar *o que* ela faz (não *por que*),
renomear ou simplificar.

Evitar condicional aninhada. Preferir early return. Sempre usar bloco `{}` — mesmo em return de
uma linha. Chaves consistentes = mais fácil de ler e diff mais seguro.

```js
// Ruim — condições aninhadas
const getLabel = (registration) => {
  if (registration) {
    if (registration.fullName) {
      return registration.fullName
    }
  }
  return "Sem nome"
}

// Ruim — early return sem chaves
const getRegistrationLabel = (registration) => {
  if (!registration?.fullName) return "Sem nome"
  return registration.fullName
}

// Bom
const getRegistrationLabel = (registration) => {
  if (!registration?.fullName) {
    return "Sem nome"
  }

  return registration.fullName
}
```

---

## JavaScript, não TypeScript

O projeto é JavaScript. Os tipos vêm de **JSDoc**, que o editor entende e usa para
autocompletar e avisar de erro, sem etapa de compilação.

Documentar com JSDoc tudo que é exportado e tem parâmetro não óbvio:

```js
/**
 * Formata um telefone só de dígitos para exibição.
 *
 * @param {string} phone - Telefone só com dígitos, ex.: "11987654321"
 * @returns {string} Telefone formatado, ex.: "(11) 98765-4321"
 */
export const formatPhone = (phone) => { ... }
```

Para formatos de objeto que aparecem em mais de um lugar, usar `@typedef`:

```js
/**
 * @typedef {Object} Registration
 * @property {string} id
 * @property {string} fullName
 * @property {"P" | "M" | "G" | "GG"} shirtSize
 * @property {3 | 5 | 10} distance
 * @property {number} [age] - Opcional
 */
```

Os colchetes em `[age]` marcam campo opcional.

### Listas fechadas de valores

Quando um campo só aceita certos valores, declarar o objeto em `constants/` e usar as chaves —
nunca espalhar a string crua pelo código.

```js
// constants/registration.js
export const SHIRT_SIZES = {
  small: "P",
  medium: "M",
  large: "G",
  extraLarge: "GG",
}

export const RACE_DISTANCES = [3, 5, 10]
```

Assim o valor existe num lugar só. Um erro de digitação em `"GG"` espalhado por cinco arquivos
não dá erro em lugar nenhum — só para de funcionar em silêncio.

### Hooks pelo namespace `React.`

Sempre usar o namespace `React.` nos hooks — não importar por destructuring.

```js
// Ruim
import { useState, useEffect } from "react"
const [count, setCount] = useState(0)

// Bom
import React from "react"
const [count, setCount] = React.useState(0)
```

Vale para todos: `React.useState`, `React.useEffect`, `React.useRef`, `React.useMemo`,
`React.useCallback`, etc.

Hooks que não são do React seguem o import normal — `useRecoilState` vem de `recoil`,
não de `React`.

---

## Estilos

Sem framework de CSS (nada de Tailwind, nada de Bootstrap). Sem estilo inline (`style={{}}`).
Estilo via CSS Modules (`.module.css`) com escopo por componente.

Detalhes de tokens, tema e unidades em [`STYLING.md`](STYLING.md).

### Layout é responsabilidade do container

O container posiciona e dimensiona os filhos com `flexbox` ou `grid` — o filho não se posiciona
sozinho.

Preferir `flex` a `grid`. Usar `grid` só quando precisar de controle nas duas dimensões
(grade de formulário, galeria de cards).

```jsx
// Ruim — o filho se posiciona
// Card.module.css: .card { margin: 0 auto; width: 50%; }

// Bom — o container controla o layout
// PageLayout.module.css: .content { display: flex; flex-direction: column; gap: var(--space-4); }
// Card.module.css: .card { /* só o visual do card */ }
```

### Nada de shorthand em CSS

Escrever toda propriedade explicitamente. Shorthand define, em silêncio, propriedades que você
não quis definir.

```css
/* Ruim — flex: 1 define também flex-shrink: 1 e flex-basis: 0% */
.item { flex: 1; }

/* Bom — só o que precisa; o resto fica no padrão do navegador */
.item { flex-grow: 1; }
```

Começar com `display: flex` ou `display: grid` e adicionar só as propriedades que aquele layout
específico exige.

### Mobile-first

Desenhar para celular primeiro. Desktop é melhoria. Só dois breakpoints:

```
base                        → celular  (< 900px)
@media (min-width: 900px)   → desktop  (≥ 900px)
```

Regras:
- Estilo base = celular. Um único `@media (min-width: 900px)` para os ajustes de desktop.
- Nada de largura fixa em `px` em container. Usar `%`, `max-width`, `flex`, `grid`.
- Alvo de toque com no mínimo `44px` de altura.
- Nada que só funcione no hover — o toque precisa funcionar também.
- Fonte mínima de `16px` em texto e inputs — abaixo disso o iOS dá zoom sozinho.
- Evitar `overflow: hidden` em container de scroll — quebra o scroll com inércia no iOS.

```css
/* Ruim — desktop-first */
.container {
  flex-direction: row;
}
@media (max-width: 899px) {
  .container { flex-direction: column; }
}

/* Bom — mobile-first */
.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
@media (min-width: 900px) {
  .container {
    flex-direction: row;
    gap: var(--space-6);
  }
}
```

### `className` e `style` em todo componente

Todo componente aceita `className` (e `style`, quando necessário) para quem usa poder ajustar
de fora. Ver `CustomButton` e `CustomInput` como referência.

```js
/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {React.CSSProperties} [props.style]
 */
```

> `style` só é aceitável para valor dinâmico que o CSS não consegue expressar (posição
> calculada em JS, por exemplo). Valor de design fixo vai sempre no módulo CSS.
