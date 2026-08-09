import { useRecoilValue } from "recoil";

import { clientConfigAtom } from "@/globalState";

/** Lê a config do app. Quem carrega é o useClientConfigSync. */
export const useClientConfig = () => {
	const clientConfig = useRecoilValue(clientConfigAtom);

	return {
		clientConfig,
		isDebug: clientConfig.isDebug === true,
		isRegistrationOpen: clientConfig.isRegistrationOpen !== false,
	};
};
