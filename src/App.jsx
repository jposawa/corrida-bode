import clsx from "clsx";
import { MainMenu } from "./components";
import { AppRouter } from "./pages";
import { useRecoilState } from "recoil";
import { themeAtom } from "./globalState";
import styles from "./App.module.css";

function App() {
	const [theme, setTheme] = useRecoilState(themeAtom);

	const handleChange = (event) => {
		const newValue = event?.target?.value;

		if (newValue) {
			setTheme((prevValue) => {
				if (prevValue === newValue) {
					return prevValue;
				}

				return newValue;
			});
		}
	};

	return (
		<div className={clsx(styles.appContainer, styles[theme])}>
			<MainMenu />
			<main className={styles.mainContainer}>
				<select value={theme} onChange={handleChange}>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
				</select>
				<AppRouter />
			</main>
		</div>
	);
}

export default App;
