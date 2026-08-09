import React from "react";
import { useSetRecoilState } from "recoil";

import { AUTH_STATUS } from "@/constants";
import { authStatusAtom, currentUserAtom } from "@/globalState";
import { observeAuthState } from "@/services";

/** Liga o observador de login aos atoms. Chamar só no App.jsx. */
export const useAuthListener = () => {
	const setCurrentUser = useSetRecoilState(currentUserAtom);
	const setAuthStatus = useSetRecoilState(authStatusAtom);

	React.useEffect(() => {
		const handleUserChange = (user) => {
			setCurrentUser(user);
			setAuthStatus(user ? AUTH_STATUS.authenticated : AUTH_STATUS.anonymous);
		};

		return observeAuthState(handleUserChange);
	}, [setCurrentUser, setAuthStatus]);
};
