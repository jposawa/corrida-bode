import { APP_KEY } from "@/constants";

/**
 * @param {string} baseString
 * @returns {string}
 */
const baseCapitalize = (baseString) => {
	if (!baseString) {
		return "";
	}

	return `${baseString[0].toUpperCase()}${baseString.slice(1)}`;
};

/**
 * @param {string} baseString
 * @param {Object} [options]
 * @param {boolean} [options.allWords=false] - Capitaliza todas as palavras
 * @param {string} [options.separator=" "] - Separador usado quando allWords é true
 * @returns {string}
 */
export const capitalize = (baseString, options = {}) => {
	if (!baseString) {
		return "";
	}

	const { allWords = false, separator = " " } = options;

	if (!allWords) {
		return baseCapitalize(baseString);
	}

	return baseString
		.split(separator)
		.map((word) => {
			return baseCapitalize(word);
		})
		.join(separator);
};

/**
 * Prefixa com o APP_KEY. Usado em chave de atom e de localStorage, que são
 * espaços globais e colidiriam entre apps.
 *
 * @param {string} baseString
 * @param {Object} [options]
 * @param {string} [options.separator="_"]
 * @returns {string}
 */
export const withPrefix = (baseString, options = {}) => {
	const { separator = "_" } = options;

	return `${APP_KEY}${separator}${baseString}`;
};
