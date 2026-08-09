import React from "react";
import { useSetRecoilState } from "recoil";

import { clientConfigAtom } from "@/globalState";
import { fetchClientConfig } from "@/services";

/** Carrega a config do banco uma vez. Chamar só no App.jsx. */
export const useClientConfigSync = () => {
	const setClientConfig = useSetRecoilState(clientConfigAtom);

	React.useEffect(() => {
		let isCancelled = false;

		fetchClientConfig()
			.then((config) => {
				if (!isCancelled) {
					setClientConfig(config);
				}
			})
			.catch((error) => {
				// Falha aqui mantém os valores padrão — o app segue funcionando.
				console.error("[useClientConfigSync] Falha ao carregar config", error);
			});

		return () => {
			isCancelled = true;
		};
	}, [setClientConfig]);
};
