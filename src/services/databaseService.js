import { get, ref, update } from "firebase/database";

import { buildDatabasePath } from "@/helpers";
import { firebaseDatabase } from "@/lib/firebase";

/**
 * Acesso genérico ao Realtime Database.
 *
 * Nó ausente é estado normal: o RTDB não tem tabela, e um ramo de ambiente novo
 * está vazio até a primeira escrita. Estas funções devolvem null/[] para que
 * nenhum caller precise checar. Ver `specs/BACKEND.md`.
 */

/**
 * @param {...(string | number)} segments
 * @returns {Promise<Object | null>}
 */
export const readNode = async (...segments) => {
	const snapshot = await get(
		ref(firebaseDatabase, buildDatabasePath(...segments)),
	);

	if (!snapshot.exists()) {
		return null;
	}

	return snapshot.val();
};

/**
 * Mescla campos no nó. `update` em vez de `set`: `set` apaga o que não for enviado.
 *
 * @param {string[]} segments
 * @param {Object} values
 * @returns {Promise<void>}
 */
export const updateNode = async (segments, values) => {
	await update(ref(firebaseDatabase, buildDatabasePath(...segments)), values);
};
