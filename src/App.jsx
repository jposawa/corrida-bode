import clsx from "clsx";
import { MdDarkMode, MdLightMode } from "react-icons/md";

import { MainMenu, Toggle } from "./components";
import { UserMenu } from "./fragments";
import {
	useAppSettings,
	useAppSettingsSync,
	useAuthListener,
	useClientConfigSync,
} from "./hooks";
import { AppRouter } from "./pages";

import styles from "./App.module.css";

// O App não renderiza <main> — quem faz isso é cada página. Ver specs/STRUCTURE.md.
function App() {
	const { theme, isDarkTheme, setIsDarkTheme } = useAppSettings();

	// Registram coisas globais: chamar só aqui.
	useClientConfigSync();
	useAuthListener();
	useAppSettingsSync();

	return (
		<div className={clsx(styles.appContainer, styles[theme])}>
			<MainMenu />

			<div className={styles.contentContainer}>
				<header className={styles.topBar}>
					<UserMenu />

					<Toggle
						label="Tema escuro"
						isChecked={isDarkTheme}
						onChange={setIsDarkTheme}
						iconOff={<MdLightMode />}
						iconOn={<MdDarkMode />}
					/>
				</header>

				<AppRouter />
			</div>
		</div>
	);
}

export default App;
