/**
 * Formatação de texto para exibição.
 *
 * Regra geral: o banco guarda o dado cru, a tela mostra o dado bonito.
 * Guardar já formatado quebra busca e comparação — `"(11) 98765-4321"` e
 * `"11987654321"` são o mesmo telefone e nunca dariam match.
 */

/**
 * Remove tudo que não for dígito.
 *
 * @param {string} value
 * @returns {string} Só os números, ex.: "11987654321"
 */
export const onlyDigits = (value) => {
	if (!value) {
		return "";
	}

	return value.replace(/\D/g, "");
};

/**
 * Formata um telefone brasileiro para leitura.
 * Aceita 10 dígitos (fixo) ou 11 (celular). Fora disso, devolve o que recebeu —
 * é melhor mostrar cru do que mostrar errado.
 *
 * @param {string} phone - Telefone só com dígitos
 * @returns {string} Ex.: "(11) 98765-4321"
 */
export const formatPhone = (phone) => {
	const digits = onlyDigits(phone);

	if (digits.length === 11) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
	}

	if (digits.length === 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}

	return phone;
};

/**
 * Formata o telefone enquanto a pessoa digita, sem travar o campo.
 * Vai montando a máscara conforme os dígitos aparecem, e ignora o que passar de 11.
 *
 * @param {string} value - O que está no input agora
 * @returns {string} O mesmo valor com a máscara aplicada até onde der
 */
export const maskPhoneInput = (value) => {
	const digits = onlyDigits(value).slice(0, 11);

	if (digits.length <= 2) {
		return digits;
	}

	if (digits.length <= 6) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	}

	if (digits.length <= 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}

	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/**
 * Junta a distância com a unidade. A distância é guardada como número puro.
 *
 * @param {number} distanceKm
 * @returns {string} Ex.: "5 km"
 */
export const formatDistance = (distanceKm) => {
	if (!distanceKm) {
		return "";
	}

	return `${distanceKm} km`;
};
