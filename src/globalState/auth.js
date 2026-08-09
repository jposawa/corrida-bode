import { atom } from "recoil";

import { AUTH_STATUS } from "@/constants";
import { withPrefix } from "@/helpers";

/** `{ uid, displayName, email, photoURL }` ou null. Escrito pelo useAuthListener. */
export const currentUserAtom = atom({
	key: withPrefix("currentUser"),
	default: null,
});

export const authStatusAtom = atom({
	key: withPrefix("authStatus"),
	default: AUTH_STATUS.loading,
});
