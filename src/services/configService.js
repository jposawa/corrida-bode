import { BASE_CLIENT_CONFIG, DATABASE_NODES } from "@/constants";

import { readNode } from "./databaseService";

/**
 * Config do app vinda do banco, mesclada com os valores padrão.
 * Nó ausente devolve só o padrão — é o caso normal num ambiente novo.
 *
 * @returns {Promise<Object>}
 */
export const fetchClientConfig = async () => {
	const remoteConfig = await readNode(DATABASE_NODES.clientConfig);

	return { ...BASE_CLIENT_CONFIG, ...remoteConfig };
};
