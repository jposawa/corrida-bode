# Instruções para o agente

## O projeto

App de inscrição para a **Corrida do Bode**. React + Vite, JavaScript (sem TypeScript),
Recoil para estado global, CSS Modules, Firebase (Realtime Database + login com Google).

O código é escrito em colaboração com alguém **começando em React**. Isso muda como escrever:

- Preferir o caminho direto ao caminho esperto. Abstração só quando a repetição já doer.
- Comentar o *porquê* das decisões não óbvias, em pt-br. Não comentar o que o código já diz.
- Ao introduzir um conceito novo de React ou de Firebase, explicar em uma linha o que ele faz.

## Comunicação

Skill caveman SEMPRE ativa. Invocar via `/caveman` (padrão: nível full).
Cortar artigos, fragmento serve, sinônimo curto. Termo técnico exato. Bloco de código intacto.
Desligar só se o usuário disser "stop caveman" ou "normal mode".

Níveis: `/caveman lite` | `/caveman full` (se não especificado, usar só `/caveman`)

## Idioma

- Código (identificadores, nomes de arquivo, constantes) → **inglês**
- Comentários, textos de UI, mensagens de erro para o usuário → **pt-br**
- Documentos de spec e README → **pt-br**

Commits e mensagens de PR seguem o padrão de escrita normal, sem caveman.

## Specs

Ler os arquivos relevantes em `specs/` **antes de começar qualquer tarefa** — toda tarefa, não
só a primeira da sessão:

- `specs/DOMAIN.md` — o domínio: inscrição, participante, organização, pagamento e doação
- `specs/STANDARDS.md` — padrões de código, convenções, JSDoc
- `specs/STRUCTURE.md` — estrutura de pastas, o que vai em cada uma, nomes
- `specs/STYLING.md` — tokens de CSS, tema, unidades, responsividade
- `specs/BACKEND.md` — Firebase, modelagem no Realtime Database, regras de segurança
- `specs/CONFIG.md` — variáveis de ambiente e configuração em tempo de execução

Specs são a fonte da verdade. Conflito entre spec e código existente → avisar o usuário e
confirmar com ele. Como você não é desenvolvedor, quem decide é o usuário — principalmente
@jposawa.

## Acordo de trabalho

### Sempre reconsultar as specs

Consultar spec não é passo de uma vez por sessão. Antes de cada tarefa nova, reler os arquivos
que aquela tarefa toca. Uma spec lida vinte turnos atrás pode ter mudado desde então — pelo
usuário, ou por você.

### Não confiar em memória velha

Não responder de memória sobre conteúdo de arquivo, estado do projeto ou decisões depois de
alguns turnos. Reler o arquivo. Refazer a checagem. O que era verdade antes na sessão não é
prova de que continua sendo, e uma resposta confiante construída em memória velha é pior que
uma resposta lenta construída numa leitura fresca.

Vale igual para memórias persistidas: elas registram o que era verdade quando foram escritas,
não o que é verdade agora.

### Pergunta do usuário é pergunta de verdade

Quando @jposawa pergunta — "por que essa abordagem?", "tem certeza?", "e o X?" — é uma pergunta
real, feita para entender o raciocínio e os trade-offs. **Não** é uma cutucada apontando para
outra resposta, nem sinal de que a resposta anterior estava errada.

Então: responder a pergunta. Explicar o raciocínio. Não reverter uma posição correta só porque
ela foi questionada, e não hesitar só para parecer agradável. Se o raciocínio estava mesmo
errado, dizer isso com todas as letras e corrigir — mas só quando estiver de fato errado, não
porque a pergunta soou como pressão.

## Segredos

O arquivo `.env` **nunca** vai para o Git. O `.env.example` vai, sempre sem valores reais.
Nunca colocar chave de service account, senha ou token de admin no front-end — ver
`specs/BACKEND.md`.
