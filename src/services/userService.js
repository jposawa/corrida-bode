import { DATABASE_NODES } from "@/constants";
import { removeUndefinedValues } from "@/helpers";

import { readNode, updateNode } from "./databaseService";

/**
 * Leitura e escrita do cadastro de usuários (`{ambiente}/users`).
 *
 * O nó é indexado pelo `uid` do Firebase Authentication, e o `uid` **também é
 * gravado dentro do registro**. Parece redundante e não é: no Realtime Database a
 * chave só existe no caminho, não no valor. Ao ler uma lista com
 * `readNodeAsList()` ou ao passar um usuário adiante como objeto solto, a chave
 * ficaria para trás — e aí um registro sem identidade circula pelo app. Com o
 * campo repetido, o objeto se basta sozinho.
 *
 * A regra de segurança valida que o campo bate com a chave, então a duplicação
 * não pode divergir. Ver `specs/BACKEND.md`.
 */

/**
 * Busca um usuário pelo uid.
 *
 * Devolve `null` quando não existe — o que é o caso normal no primeiro login, e
 * também logo depois de trocar de ambiente, quando o ramo inteiro está vazio.
 *
 * @param {string} userId
 * @returns {Promise<Object | null>}
 */
export const fetchUserById = async (userId) => {
	if (!userId) {
		return null;
	}

	return readNode(DATABASE_NODES.users, userId);
};

/**
 * Cria ou atualiza o registro do usuário. Chamado a cada login com Google.
 *
 * Não existe "criar conta" separado de "entrar": o Google resolve a identidade, e
 * do lado do app os dois casos são a mesma escrita. A única diferença é o
 * `createdAt`, que só é definido quando ainda não havia registro.
 *
 * @param {Object} authUser - Usuário vindo do Firebase Authentication
 * @returns {Promise<Object>} O registro gravado
 */
export const saveUserProfile = async (authUser) => {
	const existingUser = await fetchUserById(authUser.uid);
	const now = Date.now();

	const userRecord = removeUndefinedValues({
		// Repetido de propósito — ver o comentário no topo do arquivo.
		uid: authUser.uid,
		// O Google pode não devolver nome ou foto. `?? undefined` faz o campo ser
		// descartado antes da escrita, em vez de virar null (que APAGA a chave).
		displayName: authUser.displayName ?? undefined,
		email: authUser.email ?? undefined,
		photoURL: authUser.photoURL ?? undefined,
		// Primeiro login define createdAt; nos seguintes, preserva o que já existe.
		createdAt: existingUser?.createdAt ?? now,
		lastLoginAt: now,
	});

	await updateNode([DATABASE_NODES.users, authUser.uid], userRecord);

	return userRecord;
};
