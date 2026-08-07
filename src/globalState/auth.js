import { atom } from "recoil";

import { AUTH_STATUS } from "@/constants";
import { withPrefix } from "@/helpers/conversions";

/**
 * Usuário logado agora, no formato do app (`{ uid, displayName, email, photoURL }`).
 * `null` quando não há ninguém.
 *
 * Quem escreve neste atom é só o `useAuthListener`. O resto do app lê.
 */
export const currentUserAtom = atom({
	key: withPrefix("currentUser"),
	default: null,
});

/**
 * Em que ponto está a verificação da sessão. Ver `AUTH_STATUS`.
 */
export const authStatusAtom = atom({
	key: withPrefix("authStatus"),
	default: AUTH_STATUS.loading,
});
