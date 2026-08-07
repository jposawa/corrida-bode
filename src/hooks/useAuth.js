import React from "react";
import { useRecoilValue } from "recoil";

import { AUTH_STATUS } from "@/constants";
import { authStatusAtom, currentUserAtom } from "@/globalState";
import {
	getAuthErrorMessage,
	getIsAuthCancelledByUser,
	saveUserProfile,
	signInWithGoogle,
	signOutCurrentUser,
} from "@/services";

/**
 * Lê o estado de login e expõe as ações de entrar e sair.
 *
 * Só lê os atoms — quem alimenta eles é o `useAuthListener`, chamado uma única vez
 * no `App.jsx`. Por isso este hook pode ser usado em quantas telas quiser.
 *
 * @returns {Object} estado e ações de autenticação
 */
export const useAuth = () => {
	const currentUser = useRecoilValue(currentUserAtom);
	const authStatus = useRecoilValue(authStatusAtom);

	const [isProcessing, setIsProcessing] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState("");
	const [warningMessage, setWarningMessage] = React.useState("");

	const signIn = async () => {
		setIsProcessing(true);
		setErrorMessage("");
		setWarningMessage("");

		try {
			const authUser = await signInWithGoogle();

			// Gravar o perfil é uma segunda etapa, com tratamento próprio: se ela
			// falhar, a pessoa CONTINUA logada. Deixar o erro subir aqui derrubaria
			// um login que na verdade deu certo.
			try {
				await saveUserProfile(authUser);
			} catch (saveError) {
				console.error("[useAuth] Falha ao salvar o usuário no banco", saveError);
				setWarningMessage(
					"Você entrou, mas seus dados não foram salvos. Tente sair e entrar de novo.",
				);
			}
		} catch (signInError) {
			// Fechar o popup não é erro — é desistência. Não vira mensagem vermelha.
			if (!getIsAuthCancelledByUser(signInError)) {
				console.error("[useAuth] Falha no login", signInError);
				setErrorMessage(getAuthErrorMessage(signInError));
			}
		} finally {
			// finally garante que o botão volte do estado "entrando..." mesmo quando
			// dá erro. Num try/catch sem ele, o botão ficaria travado para sempre.
			setIsProcessing(false);
		}
	};

	const signOut = async () => {
		setIsProcessing(true);
		setErrorMessage("");
		setWarningMessage("");

		try {
			await signOutCurrentUser();
		} catch (signOutError) {
			console.error("[useAuth] Falha ao sair", signOutError);
			setErrorMessage("Não foi possível sair. Tente de novo.");
		} finally {
			setIsProcessing(false);
		}
	};

	return {
		currentUser,
		authStatus,
		isAuthenticated: authStatus === AUTH_STATUS.authenticated,
		isCheckingAuth: authStatus === AUTH_STATUS.loading,
		isProcessing,
		errorMessage,
		warningMessage,
		signIn,
		signOut,
	};
};
