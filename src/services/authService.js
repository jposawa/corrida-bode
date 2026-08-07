import {
	onAuthStateChanged,
	signInWithPopup,
	signOut as firebaseSignOut,
} from "firebase/auth";

import { firebaseAuth, googleAuthProvider } from "@/lib/firebase";

/**
 * Autenticação com Google.
 *
 * Este arquivo cuida só da identidade. Gravar o usuário no banco é outra
 * responsabilidade e mora em `userService` — separado de propósito: se a escrita
 * no banco falhar, o login continua válido, e quem chama decide o que fazer.
 */

/**
 * Converte o usuário do Firebase num objeto simples do app.
 *
 * O objeto do Firebase carrega métodos e estado interno do SDK. Guardar ele num
 * atom do Recoil espalharia o SDK pelo app inteiro — e o Recoil congela o que
 * recebe, o que dá conflito. Este recorte mantém só o que a UI usa.
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

/**
 * Traduz os códigos de erro do Firebase para mensagens em pt-br.
 *
 * @param {Error & { code?: string }} error
 * @returns {string}
 */
export const getAuthErrorMessage = (error) => {
	// Fechar o popup é uma decisão da pessoa, não uma falha. Tratado como erro
	// silencioso lá em cima — aqui só existe pelo caso de alguém querer exibir.
	if (error?.code === "auth/popup-closed-by-user") {
		return "Login cancelado.";
	}

	if (error?.code === "auth/popup-blocked") {
		return "O navegador bloqueou a janela de login. Libere os pop-ups e tente de novo.";
	}

	if (error?.code === "auth/network-request-failed") {
		return "Sem conexão. Verifique a internet e tente de novo.";
	}

	if (error?.code === "auth/unauthorized-domain") {
		return "Este endereço não está liberado no Firebase. Avise a organização.";
	}

	// Erro de configuração, não do usuário: o provedor Google não foi habilitado
	// no Console. É o primeiro erro que aparece num projeto Firebase recém-criado.
	if (error?.code === "auth/operation-not-allowed") {
		return "Login com Google não está habilitado no Firebase. Avise a organização.";
	}

	return "Não foi possível entrar. Tente de novo em instantes.";
};

/**
 * Códigos que significam "a pessoa desistiu", não "deu erro".
 * Não devem virar mensagem vermelha na tela.
 */
const CANCELLED_BY_USER_CODES = [
	"auth/popup-closed-by-user",
	"auth/cancelled-popup-request",
	"auth/user-cancelled",
];

/**
 * @param {Error & { code?: string }} error
 * @returns {boolean}
 */
export const getIsAuthCancelledByUser = (error) => {
	return CANCELLED_BY_USER_CODES.includes(error?.code);
};

/**
 * Abre o popup do Google.
 *
 * @returns {Promise<Object>} O usuário autenticado, no formato do app
 */
export const signInWithGoogle = async () => {
	const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);

	return toAppUser(credential.user);
};

/**
 * Encerra a sessão.
 *
 * @returns {Promise<void>}
 */
export const signOutCurrentUser = async () => {
	await firebaseSignOut(firebaseAuth);
};

/**
 * Registra um observador do estado de login.
 *
 * O Firebase restaura a sessão do armazenamento local de forma assíncrona: no
 * primeiro instante depois de carregar a página ele ainda não sabe se há alguém
 * logado. Por isso o callback é chamado uma vez logo de cara — com o usuário ou
 * com `null` — e é esse primeiro disparo que encerra o estado de "carregando".
 *
 * @param {(user: Object | null) => void} onUserChange
 * @returns {() => void} Função para cancelar o observador
 */
export const observeAuthState = (onUserChange) => {
	return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
		onUserChange(toAppUser(firebaseUser));
	});
};
