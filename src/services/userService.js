import { DATABASE_NODES, USER_SETTINGS_NODE } from "@/constants";
import { removeUndefinedValues } from "@/helpers";

import { readNode, updateNode } from "./databaseService";

/**
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
 * Cria ou atualiza o registro do usuário. Entrar e criar conta são a mesma
 * escrita — só o `createdAt` diferencia.
 *
 * @param {Object} authUser
 * @returns {Promise<Object>}
 */
export const saveUserProfile = async (authUser) => {
	const existingUser = await fetchUserById(authUser.uid);
	const now = Date.now();

	const userRecord = removeUndefinedValues({
		// Repetido porque a chave só existe no caminho, não no valor.
		uid: authUser.uid,
		// `?? undefined` descarta o campo; null APAGARIA a chave no RTDB.
		displayName: authUser.displayName ?? undefined,
		email: authUser.email ?? undefined,
		photoURL: authUser.photoURL ?? undefined,
		createdAt: existingUser?.createdAt ?? now,
		lastLoginAt: now,
	});

	await updateNode([DATABASE_NODES.users, authUser.uid], userRecord);

	return userRecord;
};

/**
 * Leitura única (`get`, não `onValue`) — preferência muda na tela em que a
 * pessoa está, subscrição não paga o custo.
 *
 * @param {string} userId
 * @returns {Promise<Object | null>}
 */
export const fetchUserAppSettings = async (userId) => {
	if (!userId) {
		return null;
	}

	return readNode(DATABASE_NODES.users, userId, USER_SETTINGS_NODE);
};

/**
 * @param {string} userId
 * @param {Object} settings - Só os campos que mudaram
 * @returns {Promise<void>}
 */
export const saveUserAppSettings = async (userId, settings) => {
	if (!userId) {
		return;
	}

	await updateNode([DATABASE_NODES.users, userId, USER_SETTINGS_NODE], settings);
};
