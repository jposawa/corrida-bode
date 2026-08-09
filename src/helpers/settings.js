import { APP_THEMES, BASE_USER_APP_SETTINGS, STORAGE_KEYS } from "@/constants";

import { loadStorage } from "./storage";

/**
 * @param {unknown} theme
 * @returns {boolean}
 */
export const getIsValidTheme = (theme) => {
	return Object.values(APP_THEMES).includes(theme);
};

/**
 * Tema guardado no navegador, ou o padrão.
 *
 * @returns {string}
 */
export const getStoredTheme = () => {
	const storedTheme = loadStorage(STORAGE_KEYS.appTheme, {
		isPersistent: true,
	});

	if (!getIsValidTheme(storedTheme)) {
		return BASE_USER_APP_SETTINGS.appTheme;
	}

	return storedTheme;
};
