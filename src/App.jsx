import clsx from "clsx";

import { MainMenu, ThemeToggle } from "./components";
import { UserMenu } from "./fragments";
import { useAppSettings, useAppSettingsSync, useAuthListener } from "./hooks";
import { AppRouter } from "./pages";

import styles from "./App.module.css";

// O App não renderiza <main> — quem faz isso é cada página. Ver specs/STRUCTURE.md.
function App() {
	const { theme } = useAppSettings();

	// Registram coisas globais: chamar só aqui.
	useAuthListener();
	useAppSettingsSync();

	return (
		<div className={clsx(styles.appContainer, styles[theme])}>
			<MainMenu />

			<div className={styles.contentContainer}>
				<header className={styles.topBar}>
					<UserMenu />
					<ThemeToggle />
				</header>

				<AppRouter />
			</div>
		</div>
	);
}

export default App;
