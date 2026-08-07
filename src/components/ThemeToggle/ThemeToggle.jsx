import clsx from "clsx";
import { useRecoilState } from "recoil";
import { MdDarkMode, MdLightMode } from "react-icons/md";

import { themeAtom } from "@/globalState";

import styles from "./ThemeToggle.module.css";

/**
 * Botão que alterna entre tema claro e escuro.
 *
 * Ele só lê e escreve um atom — não conduz nenhum fluxo do negócio. Por isso
 * mora em `components/` e não em `fragments/`. Ver `specs/STRUCTURE.md`.
 *
 * @param {Object} props
 * @param {string} [props.className]
 */
export const ThemeToggle = ({ className }) => {
	const [theme, setTheme] = useRecoilState(themeAtom);

	const isDark = theme === "dark";

	const handleThemeToggle = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<button
			type="button"
			className={clsx(styles.toggle, className)}
			onClick={handleThemeToggle}
			/* O ícone sozinho não diz nada para leitor de tela — o aria-label diz. */
			aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
			title={isDark ? "Tema claro" : "Tema escuro"}
		>
			{isDark ? <MdLightMode /> : <MdDarkMode />}
		</button>
	);
};
