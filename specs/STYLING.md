# Estilos

## Fonte da verdade

`src/index.css` define os tokens globais. Os CSS Modules (`.module.css`) consomem esses tokens.
Nunca escrever valor de design cru dentro de um módulo — sempre referenciar uma variável.

Onde cada coisa mora:

- `src/index.css` — tokens que **não** mudam com o tema (espaçamento, fontes, raio, z-index),
  registros `@property` e o reset.
- `src/App.module.css` — tokens de **cor**, dentro das classes `.light` e `.dark`.

---

## Variáveis CSS e tema

Tokens **de cor** ficam nas classes de tema, aplicadas no wrapper raiz em `App.jsx`.
Tokens **que não mudam com o tema** (espaçamento, fontes, raio, z-index) ficam em `:root`,
no `index.css`.

```jsx
// App.jsx — a classe vem do hook de preferências
const { theme } = useAppSettings()

<div className={clsx(styles.appContainer, styles[theme])}>
```

O tema é lido do `localStorage` **quando o módulo do atom carrega**, antes do primeiro render.
Buscar esse valor dentro de um `useEffect` faria a tela aparecer no tema claro e trocar um
instante depois — o clássico "flash" de tema errado.

O `theme` vale `"light"` ou `"dark"`, e casa com as classes `.light` / `.dark` do
`App.module.css`. Como é CSS Module, as classes ficam com escopo e não colidem com nada.

### Por que as cores mudam entre os temas

Primária e secundária usam **valores hex diferentes** em cada tema — isso não é inconsistência,
é exigência de contraste. `#c2410c` sobre branco dá ~5.2:1 e passa no WCAG AA. O mesmo laranja
sobre `#16171d` despenca e reprova; o `#fb923c` do tema escuro devolve a legibilidade (~7.9:1).
Mesma identidade, luminância diferente conforme o fundo.

Contraste de cada par, medido contra o fundo do próprio tema:

| Token | Claro | Escuro |
|-------|-------|--------|
| `--color-primary` | `#c2410c` — 5.2:1 | `#fb923c` — 7.9:1 |
| `--color-secondary` | `#15803d` — 5.0:1 | `#4ade80` — 10.3:1 |
| `--color-error` | `#b91c1c` — 6.5:1 | `#f87171` |
| `--color-warning` | `#a16207` — 4.9:1 | `#fbbf24` |

> **Ao trocar uma cor, medir o contraste nos dois temas.** Um hex que fica bonito no claro
> costuma sumir no escuro. O piso é 4.5:1 para texto normal.

**A lista completa de valores está em `src/App.module.css`, e é ela que vale.** Repetir os
hex aqui criaria dois lugares para atualizar, e um deles ficaria desatualizado. O formato é este:

```css
/* App.module.css */
.light {
  color-scheme: light;

  --color-bg: #ffffff;
  --color-bg-elevated: #fafaf9;
  --color-surface: #f5f5f4;
  /* ...texto, borda, primária, secundária, estados, sombra... */
}

.dark {
  color-scheme: dark;

  --color-bg: #16171d;
  /* ...os mesmos nomes, outros valores... */
}
```

`color-scheme` não é decoração: é o que faz o navegador desenhar barra de rolagem, campos
nativos e menus de `<select>` na cor certa. Sem ele, um `<select>` fica branco no tema escuro.

Os dois temas precisam declarar **exatamente os mesmos nomes de token**. Um token que só existe
em um dos temas vira valor vazio no outro, e o componente quebra em silêncio — sem erro no
console, só uma cor que sumiu.

### Como nomear variável

Padrão: `--categoria-variante[-estado]`

```
--color-bg               → fundo da página
--color-bg-elevated      → superfície elevada (card, modal)
--color-surface          → preenchimento sutil (bloco de código, chip)
--color-text             → texto corrido
--color-text-strong      → título, ênfase
--color-text-muted       → texto secundário, placeholder
--color-text-disabled    → estado desabilitado
--color-border           → divisória, borda de input
--color-primary          → primária base
--color-primary-bg       → fundo tingido de primária
--color-primary-border   → borda tingida de primária
--shadow-md              → sombra média
--space-4                → passo 4 da escala de espaçamento
--border-radius-md       → raio médio
```

**Nunca nomear pela intenção de uso** (`--button-color`). Nomear pelo tipo do token — cada
componente mapeia token → intenção localmente. Um token chamado `--button-color` fica errado no
dia em que aquela cor for usada num link.

---

## Escolha de unidade

A unidade se escolhe pelo que o valor é *relativo a*.

| Unidade | Relativa a | Usar para |
|---------|------------|-----------|
| `rem` | Fonte raiz | Espaçamento, tamanho de fonte, escala consistente |
| `em` | Fonte do próprio elemento | Escala interna do componente (padding relativo ao texto dele) |
| `%` | Dimensão do pai | Largura fluida, proporção |
| `vw` / `vh` | Viewport | Seção de tela cheia, altura de hero |
| `px` | Pixel físico | Borda, sombra, limites finos |

Três detalhes que não são óbvios:

- **Não encadear `em`.** `em` dentro de `em` multiplica. Passando de dois níveis, trocar por `rem`.
- **`%` de altura só funciona** se o pai tiver altura explícita.
- **`100svh`, nunca `100vh` no celular.** `vh` ignora a barra do navegador e o conteúdo fica
  cortado atrás dela no iOS.

---

## Escala tipográfica

Definir tamanhos em `rem` no nível global; usar `em` dentro do componente para hierarquia.

```css
--text-xs:   0.75rem;
--text-sm:   0.875rem;
--text-md:   1rem;      /* corpo */
--text-lg:   1.25rem;
--text-xl:   1.75rem;
--text-2xl:  2.5rem;
--text-3xl:  3.5rem;
```

```css
.sectionTitle {
  font-size: 1.4em;         /* relativo à fonte da seção */
  font-weight: 600;
  letter-spacing: -0.02em;  /* em também — acompanha o tamanho */
}
```

`letter-spacing` usa `em` porque precisa ficar proporcional ao tamanho do caractere.
Em `px`, o espaçamento fica apertado em fonte grande e frouxo em fonte pequena.

---

## Espaçamento

Usar as variáveis `--space-*` em todo lugar. Nunca escrever `rem`/`px` cru de espaçamento
dentro de módulo.

```css
/* Bom */
padding: var(--space-3) var(--space-5);
gap: var(--space-4);
margin-bottom: var(--space-2);

/* Ruim */
padding: 12px 24px;
gap: 1rem;
```

Exceção: espaçamento explicitamente ligado à fonte do componente (o vão entre um ícone e seu
rótulo, por exemplo) usa `em`.

---

## Bordas e raio

Borda sempre em `px`. Raio sempre por variável.

```css
/* Bom */
border: 1px solid var(--color-border);
border-radius: var(--border-radius-md);

/* Ruim */
border: 0.0625rem solid #ccc;
border-radius: 8px;
```

---

## Sombras

Sombra sempre por variável. Nunca escrever `box-shadow` cru num módulo.

```css
/* Bom */
box-shadow: var(--shadow-md);

/* Ruim */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

Offset, blur e spread são sempre `px` dentro da definição da variável — não devem escalar com
a fonte.

---

## Registros `@property`

Declarar `@property` para variável customizada que precise animar/transicionar. Sem isso o
navegador trata a propriedade como texto opaco e não consegue interpolar entre dois valores —
a transição vira um corte seco.

Registrar **antes** do `:root`, no `index.css`.

```css
@property --color-primary {
  syntax: "<color>";
  inherits: true;
  initial-value: #0070e0;
}
```

| Campo | Para que serve |
|-------|----------------|
| `syntax` | Tipo — `<color>`, `<length>`, `<number>`, `<percentage>`, `<angle>`, `*` (opaco) |
| `inherits` | Se os filhos herdam. Sempre `true` para token de tema |
| `initial-value` | Obrigatório quando `syntax` não é `*`. Usar o valor do tema claro |

**Registrar:** os tokens `--color-*` (animáveis na troca de tema).
**Não registrar:** família de fonte (só `syntax: "*"`, sem animação), `--space-*`, z-index.

---

## Foco e acessibilidade

Todo elemento interativo precisa de estilo visível de `:focus-visible`. Usar `outline` com
valores em `px` — nunca remover o outline sem colocar outra coisa no lugar.

```css
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

Isso não é detalhe estético: sem foco visível, quem navega por teclado não consegue saber onde
está na página.

Alvo de toque mínimo: `44px` de altura (ou `44px × 44px` em botão só de ícone).

---

## Transições

Transição sempre em propriedades específicas. Nunca `transition: all`.

```css
/* Bom */
transition: border-color 0.2s ease, box-shadow 0.2s ease;

/* Ruim */
transition: all 0.3s;
```

`all` faz o navegador vigiar toda propriedade que mudar, inclusive as que você não quis animar —
e o custo aparece em animação travada em celular.

Duração de referência:
- Micro-interação (hover, foco): `150ms – 200ms`
- Painel, gaveta: `250ms – 300ms`
- Transição de página: `300ms – 400ms`
