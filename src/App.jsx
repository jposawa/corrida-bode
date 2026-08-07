import clsx from "clsx";
import { useRecoilValue } from "recoil";

import { MainMenu, ThemeToggle } from "./components";
import { UserMenu } from "./fragments";
import { themeAtom } from "./globalState";
import { useAuthListener } from "./hooks";
import { AppRouter } from "./pages";

import styles from "./App.module.css";

/**
 * Casca do app: menu, barra de topo e área onde a página entra.
 *
 * O App NÃO renderiza `<main>` — quem faz isso é cada página. O HTML só permite
 * um `<main>` visível por documento, e como o roteador mostra uma página por vez,
 * a conta fecha. Ver `specs/STRUCTURE.md`.
 */
function App() {
	const theme = useRecoilValue(themeAtom);

	// Registra o observador de login. Chamado SÓ aqui — ver o comentário no hook.
	useAuthListener();

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
