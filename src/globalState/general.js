import { atom } from "recoil";

import { getStoredTheme, withPrefix } from "@/helpers";

// getStoredTheme roda no carregamento do módulo, antes do primeiro render.
// Buscar em useEffect faria a tela piscar no tema errado.
export const themeAtom = atom({
	key: withPrefix("theme"),
	default: getStoredTheme(),
});
