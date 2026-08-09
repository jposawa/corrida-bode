import { APP_KEY } from "./app";

/**
 * A árvore é `{projeto}/{ambiente}/...`.
 *
 * Uma instância de RTDB costuma hospedar mais de um app, então o nó do projeto
 * não é opcional. Ver `specs/BACKEND.md`.
 */

export const DATABASE_ROOT = APP_KEY;

// Padrão staging: variável faltando grava em teste, nunca em produção.
export const DATABASE_TARGET_ENV =
	import.meta.env.VITE_DATABASE_TARGET_ENV || "staging";

/** Nó das preferências, dentro de `users/{uid}`. */
export const USER_SETTINGS_NODE = "appSettings";

export const DATABASE_NODES = {
	users: "users",
	registrations: "registrations",
	registrationsByUser: "registrationsByUser",
	admins: "admins",
	eventInfo: "eventInfo",
};
