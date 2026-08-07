# Estilos

## Fonte da verdade

`src/index.css` define os tokens globais. Os CSS Modules (`.module.css`) consomem esses tokens.
Nunca escrever valor de design cru dentro de um módulo — sempre referenciar uma variável.

> **Estado atual:** o `index.css` ainda tem só o punhado de variáveis que veio do template.
> A lista completa abaixo é o alvo. Ir preenchendo conforme as telas forem construídas — não
> vale a pena declarar cinquenta tokens antes de existir tela que use.

---

## Variáveis CSS e tema

Tokens **de cor** ficam nas classes de tema, aplicadas no wrapper raiz em `App.jsx`.
Tokens **que não mudam com o tema** (espaçamento, fontes, raio, z-index) ficam em `:root`,
no `index.css`.

```jsx
// App.jsx — a classe vem do atom themeAtom (Recoil)
const [theme] = useRecoilState(themeAtom)

<div className={clsx(styles.appContainer, styles[theme])}>
```

O `theme` vale `"light"` ou `"dark"`, e casa com as classes `.light` / `.dark` do
`App.module.css`. Como é CSS Module, as classes ficam com escopo e não colidem com nada.

### Por que as cores mudam entre os temas

Primária e secundária usam **valores hex diferentes** em cada tema — isso não é inconsistência,
é exigência de contraste. `#0070E0` sobre branco passa no WCAG AA (~4.8:1). O mesmo azul sobre
`#16171d` cai para ~3.0:1 e reprova. Um tom mais claro devolve a legibilidade.
Mesma identidade, luminância diferente conforme o fundo.

> A paleta abaixo é a que veio do template e serve como ponto de partida. As cores da Corrida
> do Bode ainda não foram definidas — quando forem, trocar os valores mantendo os nomes dos
> tokens. Nenhum componente precisa mudar.

```css
/* ─── Tokens que não mudam com o tema (index.css) ─── */
:root {
  --border-radius-md: 8px;
  --font-sans: system-ui, "Segoe UI", Roboto, sans-serif;
  --space-4: 1rem;
  /* ... */
}

/* ─── Tema claro (App.module.css) ─── */
.light {
  color-scheme: light;
  background: var(--color-bg);
  color: var(--color-text);

  /* — camadas de fundo — */
  --color-bg: #ffffff;
  --color-bg-elevated: #f9f9fb;
  --color-surface: #f4f3ec;

  /* — texto — */
  --color-text: #6b6375;
  --color-text-strong: #08060d;
  --color-text-muted: #9ca3af;
  --color-text-disabled: #c4c4c4;

  /* — borda — */
  --color-border: #e5e4e7;

  /* — primária — */
  --color-primary: #0070e0;
  --color-primary-bg: rgba(0, 112, 224, 0.08);
  --color-primary-border: rgba(0, 112, 224, 0.4);

  /* — secundária — */
  --color-secondary: #0ea472;
  --color-secondary-bg: rgba(14, 164, 114, 0.08);
  --color-secondary-border: rgba(14, 164, 114, 0.4);

  /* — sombra — */
  --shadow-sm: rgba(0, 0, 0, 0.06) 0 1px 3px 0;
  --shadow-md: rgba(0, 0, 0, 0.1) 0 4px 6px -2px, rgba(0, 0, 0, 0.05) 0 10px 15px -3px;
  --shadow-lg: rgba(0, 0, 0, 0.15) 0 20px 25px -5px, rgba(0, 0, 0, 0.08) 0 10px 10px -5px;
}

/* ─── Tema escuro (App.module.css) ─── */
.dark {
  color-scheme: dark;
  background: var(--color-bg);
  color: var(--color-text);

  --color-bg: #16171d;
  --color-bg-elevated: #1e1f28;
  --color-surface: #1f2028;
  --color-text: #9ca3af;
  --color-text-strong: #f3f4f6;
  --color-text-muted: #6b7280;
  --color-text-disabled: #4b5563;
  --color-border: #2e303a;
  --color-primary: #4da3f5;
  --color-primary-bg: rgba(77, 163, 245, 0.12);
  --color-primary-border: rgba(77, 163, 245, 0.4);
  --color-secondary: #2dc88a;
  --color-secondary-bg: rgba(45, 200, 138, 0.12);
  --color-secondary-border: rgba(45, 200, 138, 0.4);
  --shadow-sm: rgba(0, 0, 0, 0.25) 0 1px 3px 0;
  --shadow-md: rgba(0, 0, 0, 0.4) 0 4px 6px -2px, rgba(0, 0, 0, 0.25) 0 10px 15px -3px;
  --shadow-lg: rgba(0, 0, 0, 0.5) 0 20px 25px -5px, rgba(0, 0, 0, 0.3) 0 10px 10px -5px;
}
```

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

### `px` — travas e fios de cabelo

Usar `px` quando o valor **não pode** escalar com fonte ou viewport:

```css
/* bordas — sempre px */
border: 1px solid var(--color-border);
outline: 2px solid var(--color-primary);

/* sombras — offset e blur em px */
box-shadow: var(--shadow-md);

/* limites finos */
max-width: 1126px;
min-height: 44px; /* piso do alvo de toque */
```

### `rem` — escala global

Para espaçamento e tamanho de fonte que precisam escalar junto com a fonte raiz.

```css
gap: var(--space-4);
padding: var(--space-3) var(--space-5);

font-size: 0.875rem;   /* pequeno / legenda */
font-size: 1rem;       /* corpo */
font-size: 1.25rem;    /* destaque */
```

### `em` — relativo ao contexto

Dentro de um componente, quando o tamanho deve ser proporcional à fonte *do próprio
componente*.

```css
/* título dentro de um card — acompanha a fonte do card */
.cardTitle {
  font-size: 1.3em;
  margin-bottom: 0.5em;
}

/* padding do botão acompanha a fonte dele */
.button {
  padding: 0.6em 1.2em;
}

/* ícone ao lado do texto fica proporcional */
.icon {
  width: 1em;
  height: 1em;
}
```

**Evitar encadear `em`** — `em` dentro de `em` multiplica e o tamanho vai desandando.
Passando de dois níveis de aninhamento, trocar por `rem`.

### `%` — containers fluidos

Para largura que precisa preencher o pai proporcionalmente. Nunca usar `%` para altura, a menos
que o pai tenha altura explícita.

```css
.input {
  width: 100%;
}

.sidebar {
  width: 30%;
  min-width: 200px; /* piso em px */
}
```

### `vw` / `vh` — seções presas ao viewport

Usar com parcimônia. Serve para hero e overlay de tela cheia.

```css
.hero {
  min-height: 60vh;
}
```

Evitar `100vh` no celular — usar `100svh` (small viewport height), que desconta a barra do
navegador. Com `100vh` o conteúdo fica cortado atrás da barra de endereço no iOS.

```css
min-height: 100svh;
```

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
