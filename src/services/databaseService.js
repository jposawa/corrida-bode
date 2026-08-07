import { get, ref, update } from "firebase/database";

import { buildDatabasePath } from "@/helpers";
import { firebaseDatabase } from "@/lib/firebase";

/**
 * Acesso genérico ao Realtime Database.
 *
 * Todo o resto do app lê e escreve por aqui — assim a regra de "nó que não existe
 * não quebra nada" mora num lugar só, em vez de depender de cada chamada lembrar.
 *
 * ## Por que isso importa neste projeto
 *
 * O Realtime Database **não tem tabela**. Um nó só passa a existir quando alguém
 * grava algo nele; não dá para criar `users` vazio e deixar esperando. Então, num
 * ramo novo (trocou `VITE_DATABASE_TARGET_ENV` de `staging` para `production`),
 * **todos** os caminhos estão ausentes até a primeira escrita.
 *
 * Ler um caminho ausente **não dá erro**: devolve um snapshot com
 * `exists() === false` e `val() === null`. Quem quebra é o código que assume que
 * veio objeto — `snapshot.val().nome` estoura com "Cannot read properties of null".
 * As funções abaixo devolvem `null` ou `[]` justamente para esse acesso nunca
 * acontecer.
 */

/**
 * Lê um nó. Devolve `null` se ele não existir.
 *
 * @param {...(string | number)} segments - Caminho, sem o prefixo do ambiente
 * @returns {Promise<Object | null>}
 */
export const readNode = async (...segments) => {
	const path = buildDatabasePath(...segments);
	const snapshot = await get(ref(firebaseDatabase, path));

	if (!snapshot.exists()) {
		return null;
	}

	return snapshot.val();
};

/**
 * Lê um nó que guarda uma coleção e devolve uma lista.
 *
 * No Realtime Database uma coleção é um objeto com os ids como chave —
 * `{ abc: {...}, def: {...} }`, não um array. Esta função converte, colocando o
 * id dentro de cada item. Coleção ausente ou vazia devolve `[]`, nunca `null`:
 * assim quem chama pode dar `.map()` direto, sem checar antes.
 *
 * @param {...(string | number)} segments
 * @returns {Promise<Array<Object>>}
 */
export const readNodeAsList = async (...segments) => {
	const value = await readNode(...segments);

	if (!value) {
		return [];
	}

	return Object.entries(value).map(([id, item]) => {
		return { id, ...item };
	});
};

/**
 * Verifica se um nó existe. Útil para checagens que não precisam do conteúdo.
 *
 * @param {...(string | number)} segments
 * @returns {Promise<boolean>}
 */
export const nodeExists = async (...segments) => {
	const value = await readNode(...segments);

	return value !== null;
};

/**
 * Grava (ou mescla) campos num nó.
 *
 * Usa `update`, não `set`: `set` **substitui o nó inteiro**, apagando qualquer
 * campo que não esteja no objeto enviado. `update` mexe só nas chaves passadas.
 *
 * Se o nó (ou qualquer nível acima dele) não existir, o Firebase cria o caminho
 * todo nesta escrita — é assim que um ramo de ambiente novo nasce.
 *
 * @param {string[]} segments - Caminho, sem o prefixo do ambiente
 * @param {Object} values - Campos a gravar
 * @returns {Promise<void>}
 */
export const updateNode = async (segments, values) => {
	const path = buildDatabasePath(...segments);

	await update(ref(firebaseDatabase, path), values);
};
