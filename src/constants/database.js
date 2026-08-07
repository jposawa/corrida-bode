import { APP_KEY } from "./app";

/**
 * Caminhos da árvore do Realtime Database.
 *
 * ## Esta instância é COMPARTILHADA entre vários projetos
 *
 * O banco `jprojetos` hospeda mais de um app, e a convenção é: **o primeiro nível
 * da raiz é o nome do projeto**. Por isso tudo daqui pende de `corrida-bode/`.
 *
 * Gravar direto na raiz — `staging/...` em vez de `corrida-bode/staging/...` —
 * criaria um nó ambíguo (staging de qual projeto?) que colidiria com qualquer
 * outro app que usasse o mesmo nome.
 *
 * Dentro do nosso nó, o segundo nível é o ambiente:
 *
 * ```
 * corrida-bode/staging/registrations
 * corrida-bode/production/registrations
 * ```
 *
 * Ver `specs/BACKEND.md` e `specs/CONFIG.md`.
 */

/** Nó raiz do projeto dentro do banco compartilhado. */
export const DATABASE_ROOT = APP_KEY;

/**
 * Ambiente de dados alvo, vindo de `VITE_DATABASE_TARGET_ENV`.
 *
 * O padrão é `staging` de propósito: se a variável faltar no build, o app grava
 * no ramo de teste. O contrário — cair em produção por esquecimento — é o erro
 * que não dá para desfazer.
 */
export const DATABASE_TARGET_ENV =
	import.meta.env.VITE_DATABASE_TARGET_ENV || "staging";

/** Nós de primeiro nível dentro do ramo do ambiente. */
export const DATABASE_NODES = {
	users: "users",
	registrations: "registrations",
	registrationsByUser: "registrationsByUser",
	admins: "admins",
	eventInfo: "eventInfo",
};
