import { useRecoilState, useRecoilValue } from "recoil";

import { APP_THEMES, STORAGE_KEYS } from "@/constants";
import { currentUserAtom, themeAtom } from "@/globalState";
import { saveStorage } from "@/helpers";
import { saveUserAppSettings } from "@/services";

export const useAppSettings = () => {
	const [theme, setTheme] = useRecoilState(themeAtom);
	const currentUser = useRecoilValue(currentUserAtom);

	const isDarkTheme = theme === APP_THEMES.dark;

	/** Aplica e guarda no navegador, sem tocar no banco. */
	const applyTheme = (nextTheme) => {
		setTheme(nextTheme);
		saveStorage(STORAGE_KEYS.appTheme, nextTheme, { isPersistent: true });
	};

	const changeTheme = (nextTheme) => {
		applyTheme(nextTheme);

		if (!currentUser?.uid) {
			return;
		}

		// Sem await: a tela já reagiu, e falha de rede não pode travar um clique.
		saveUserAppSettings(currentUser.uid, { appTheme: nextTheme }).catch(
			(error) => {
				console.error("[useAppSettings] Falha ao salvar tema na conta", error);
			},
		);
	};

	const toggleTheme = () => {
		changeTheme(isDarkTheme ? APP_THEMES.light : APP_THEMES.dark);
	};

	return { theme, isDarkTheme, applyTheme, changeTheme, toggleTheme };
};
