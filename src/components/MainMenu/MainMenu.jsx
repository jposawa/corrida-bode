import { Link } from "react-router-dom";
import styles from "./MainMenu.module.css";
import { NAVIGATION_PAGES } from "@/constants";

export const MainMenu = () => {
	const menuPages = Object.values(NAVIGATION_PAGES);
	return (
		<nav className={styles.mainMenu}>
			{menuPages.map((menuItem, index) => {
				return (
					<Link
						key={`${menuItem.path}-${index}`}
						to={menuItem.path}
						className={styles.menuItem}
						style={{
							order: menuItem.order,
						}}
					>
						{menuItem.icon && (
							<span className={styles.icon}>{menuItem.icon}</span>
						)}
						<span>{menuItem.label}</span>
					</Link>
				);
			})}
		</nav>
	);
};
