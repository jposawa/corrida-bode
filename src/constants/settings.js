/** Casam com as classes `.light` / `.dark` do App.module.css. */
export const APP_THEMES = {
	light: "light",
	dark: "dark",
};

export const STORAGE_KEYS = {
	appTheme: "appTheme",
};

export const BASE_USER_APP_SETTINGS = {
	appTheme: APP_THEMES.light,
};

/**
 * Config do app, editada no Console do Firebase e lida em `clientConfig`.
 * Vale enquanto o banco não responde, ou quando o nó ainda não existe.
 */
export const BASE_CLIENT_CONFIG = {
	isDebug: false,
	isRegistrationOpen: true,
};
