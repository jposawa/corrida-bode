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

			// Falha ao gravar o perfil não derruba o login, que já deu certo.
			try {
				await saveUserProfile(authUser);
			} catch (saveError) {
				console.error("[useAuth] Falha ao salvar o usuário", saveError);
				setWarningMessage(
					"Você entrou, mas seus dados não foram salvos. Tente sair e entrar de novo.",
				);
			}
		} catch (signInError) {
			if (!getIsAuthCancelledByUser(signInError)) {
				console.error("[useAuth] Falha no login", signInError);
				setErrorMessage(getAuthErrorMessage(signInError));
			}
		} finally {
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
