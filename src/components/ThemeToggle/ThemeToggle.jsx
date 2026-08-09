import clsx from "clsx";
import { MdDarkMode, MdLightMode } from "react-icons/md";

import { useAppSettings } from "@/hooks";

import styles from "./ThemeToggle.module.css";

/**
 * @param {Object} props
 * @param {string} [props.className]
 */
export const ThemeToggle = ({ className }) => {
	const { isDarkTheme, toggleTheme } = useAppSettings();

	return (
		<button
			type="button"
			role="switch"
			aria-checked={isDarkTheme}
			aria-label="Tema escuro"
			onClick={toggleTheme}
			className={clsx(styles.toggle, isDarkTheme && styles.checked, className)}
		>
			<MdLightMode className={styles.icon} />
			<MdDarkMode className={styles.icon} />
			<span className={styles.thumb} />
		</button>
	);
};
