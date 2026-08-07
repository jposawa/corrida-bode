/**
 * Utilitários de objeto.
 */

/**
 * Devolve uma cópia sem as chaves cujo valor é `undefined`.
 *
 * O Realtime Database **rejeita `undefined`** com erro em tempo de execução, e
 * trata `null` como "apague esta chave". Dados que vêm do Google (foto, nome)
 * podem chegar vazios, então tudo que vai para o banco passa por aqui antes.
 *
 * @param {Object} source
 * @returns {Object} Novo objeto, só com as chaves preenchidas
 */
export const removeUndefinedValues = (source) => {
	if (!source) {
		return {};
	}

	const result = {};

	for (const [key, value] of Object.entries(source)) {
		if (value !== undefined) {
			result[key] = value;
		}
	}

	return result;
};
