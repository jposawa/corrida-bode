import React from "react";
import { useSetRecoilState } from "recoil";

import { AUTH_STATUS } from "@/constants";
import { authStatusAtom, currentUserAtom } from "@/globalState";
import { observeAuthState } from "@/services";

/**
 * Liga o observador de login do Firebase aos atoms do app.
 *
 * **Chamar UMA vez só, no `App.jsx`.** Cada chamada registra um observador novo
 * no Firebase; usar este hook em várias telas criaria observadores duplicados que
 * escrevem no mesmo atom.
 *
 * Para *ler* quem está logado, use `useAuth()` — ele não registra nada.
 */
export const useAuthListener = () => {
	const setCurrentUser = useSetRecoilState(currentUserAtom);
	const setAuthStatus = useSetRecoilState(authStatusAtom);

	React.useEffect(() => {
		const handleUserChange = (user) => {
			setCurrentUser(user);
			setAuthStatus(user ? AUTH_STATUS.authenticated : AUTH_STATUS.anonymous);
		};

		const unsubscribe = observeAuthState(handleUserChange);

		// Devolver a função de limpeza cancela o observador quando o componente sai.
		// Sem isso, o Firebase continuaria chamando um setState de componente morto.
		return unsubscribe;
	}, [setCurrentUser, setAuthStatus]);
};
