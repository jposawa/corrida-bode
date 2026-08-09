import {
	onAuthStateChanged,
	signInWithPopup,
	signOut as firebaseSignOut,
} from "firebase/auth";

import { firebaseAuth, googleAuthProvider } from "@/lib/firebase";

/**
 * Só identidade. Gravar o usuário no banco é do `userService` — separado para
 * que uma falha de escrita não derrube um login que deu certo.
 */

/**
 * Recorta o objeto do Firebase. O SDK carrega métodos e estado interno que o
 * Recoil congelaria.
 *
 * @param {Object | null} firebaseUser
 * @returns {Object | null}
 */
export const toAppUser = (firebaseUser) => {
	if (!firebaseUser) {
		return null;
	}

	return {
		uid: firebaseUser.uid,
		displayName: firebaseUser.displayName,
		email: firebaseUser.email,
		photoURL: firebaseUser.photoURL,
	};
};

const AUTH_ERROR_MESSAGES = {
	"auth/popup-closed-by-user": "Login cancelado.",
	"auth/popup-blocked":
		"O navegador bloqueou a janela de login. Libere os pop-ups e tente de novo.",
	"auth/network-request-failed":
		"Sem conexão. Verifique a internet e tente de novo.",
	"auth/unauthorized-domain":
		"Este endereço não está liberado no Firebase. Avise a organização.",
	"auth/operation-not-allowed":
		"Login com Google não está habilitado no Firebase. Avise a organização.",
};

/** Fechar o popup é desistência, não falha — não vira mensagem de erro. */
const CANCELLED_BY_USER_CODES = [
	"auth/popup-closed-by-user",
	"auth/cancelled-popup-request",
	"auth/user-cancelled",
];

/**
 * @param {Error & { code?: string }} error
 * @returns {string}
 */
export const getAuthErrorMessage = (error) => {
	return (
		AUTH_ERROR_MESSAGES[error?.code] ??
		"Não foi possível entrar. Tente de novo em instantes."
	);
};

/**
 * @param {Error & { code?: string }} error
 * @returns {boolean}
 */
export const getIsAuthCancelledByUser = (error) => {
	return CANCELLED_BY_USER_CODES.includes(error?.code);
};

/**
 * @returns {Promise<Object>}
 */
export const signInWithGoogle = async () => {
	const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);

	return toAppUser(credential.user);
};

/**
 * @returns {Promise<void>}
 */
export const signOutCurrentUser = async () => {
	await firebaseSignOut(firebaseAuth);
};

/**
 * O Firebase restaura a sessão de forma assíncrona: o callback dispara uma vez
 * logo de cara (com usuário ou null), e é isso que encerra o estado "loading".
 *
 * @param {(user: Object | null) => void} onUserChange
 * @returns {() => void} Cancela o observador
 */
export const observeAuthState = (onUserChange) => {
	return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
		onUserChange(toAppUser(firebaseUser));
	});
};
