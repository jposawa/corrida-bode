import React from "react";
import { useRecoilValue } from "recoil";

import { currentUserAtom } from "@/globalState";
import { fetchUserAppSettings, saveUserAppSettings } from "@/services";

import { useAppSettings } from "./useAppSettings";

/**
 * Puxa as preferências da conta no login e aplica.
 * Conta sem preferência recebe a escolha local. Chamar só no App.jsx.
 */
export const useAppSettingsSync = () => {
	const currentUser = useRecoilValue(currentUserAtom);
	const { theme, applyTheme } = useAppSettings();

	// Refs para o efeito LER o valor atual sem REAGIR a ele — `theme` nas
	// dependências faria cada troca de tema disparar outra leitura no banco.
	const themeRef = React.useRef(theme);
	const applyThemeRef = React.useRef(applyTheme);

	themeRef.current = theme;
	applyThemeRef.current = applyTheme;

	const userId = currentUser?.uid;

	React.useEffect(() => {
		if (!userId) {
			return;
		}

		let isCancelled = false;

		const syncSettings = async () => {
			try {
				const settings = await fetchUserAppSettings(userId);

				if (isCancelled) {
					return;
				}

				if (settings?.appTheme) {
					applyThemeRef.current(settings.appTheme);
					return;
				}

				await saveUserAppSettings(userId, { appTheme: themeRef.current });
			} catch (error) {
				console.error("[useAppSettingsSync] Falha ao sincronizar", error);
			}
		};

		syncSettings();

		return () => {
			isCancelled = true;
		};
	}, [userId]);
};
