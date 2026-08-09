import { withPrefix } from "./conversions";

// localStorage é compartilhado por domínio — o prefixo evita colisão entre apps.

/**
 * @param {string} key
 * @param {unknown} value
 * @param {Object} [options]
 * @param {boolean} [options.needParse=false]
 * @param {boolean} [options.isPersistent=false] - localStorage em vez de sessionStorage
 */
export const saveStorage = (key, value, options = {}) => {
	const { needParse = false, isPersistent = false } = options;
	const storage = isPersistent ? localStorage : sessionStorage;
	const formattedValue = needParse ? JSON.stringify(value) : `${value}`;

	try {
		storage.setItem(withPrefix(key), formattedValue);
	} catch (error) {
		// Modo privado ou cota estourada. Preferência não pode derrubar a tela.
		console.warn("[saveStorage] Falha ao gravar", key, error);
	}
};

/**
 * @param {string} key
 * @param {Object} [options]
 * @param {boolean} [options.needParse=false]
 * @param {boolean} [options.isPersistent=false]
 * @returns {unknown | null}
 */
export const loadStorage = (key, options = {}) => {
	const { needParse = false, isPersistent = false } = options;
	const storage = isPersistent ? localStorage : sessionStorage;

	try {
		const value = storage.getItem(withPrefix(key));

		if (value === null) {
			return null;
		}

		return needParse ? JSON.parse(value) : value;
	} catch (error) {
		console.warn("[loadStorage] Falha ao ler", key, error);
		return null;
	}
};

/**
 * @param {string} key
 * @param {boolean} [isPersistent=false]
 */
export const removeStorage = (key, isPersistent = false) => {
	const storage = isPersistent ? localStorage : sessionStorage;

	storage.removeItem(withPrefix(key));
};
