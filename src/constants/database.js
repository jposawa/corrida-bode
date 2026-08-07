/**
 * Caminhos da árvore do Realtime Database.
 *
 * O banco é uma árvore JSON só. Staging e produção convivem dentro da mesma
 * instância, separados pelo primeiro nível — `staging/registrations` e
 * `production/registrations` são ramos independentes.
 *
 * Assim dá para testar sem sujar os dados reais, sem precisar de um segundo
 * projeto no Firebase. Ver `specs/BACKEND.md` e `specs/CONFIG.md`.
 */

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
