import clsx from "clsx";
import { NavLink } from "react-router-dom";

import { NAVIGATION_PAGES } from "@/constants";

import styles from "./MainMenu.module.css";

/**
 * Menu principal. No celular fica embaixo (alcance do polegar);
 * no desktop vira uma coluna à esquerda.
 *
 * Usa `NavLink` em vez de `Link` porque ele sabe qual rota está ativa —
 * a função no `className` recebe `{ isActive }` e o menu se pinta sozinho.
 */
export const MainMenu = () => {
	// Ordena aqui, no lugar de usar `order` no CSS: assim a ordem visual e a
	// ordem de navegação por Tab são a mesma. Com `order` elas se separam,
	// e quem usa teclado pula os itens fora de ordem.
	const menuPages = Object.values(NAVIGATION_PAGES).sort((pageA, pageB) => {
		return pageA.order - pageB.order;
	});

	/** O NavLink chama esta função a cada render e informa se a rota está ativa. */
	const getMenuItemClassName = ({ isActive }) => {
		return clsx(styles.menuItem, isActive && styles.active);
	};

	return (
		<nav className={styles.mainMenu} aria-label="Navegação principal">
			{menuPages.map((menuItem) => {
				return (
					<NavLink
						key={menuItem.path}
						to={menuItem.path}
						className={getMenuItemClassName}
						/* `end` só na home: sem ele, "/" casaria com toda rota e o
						   item Início ficaria sempre marcado como ativo. */
						end={menuItem.path === "/"}
					>
						{menuItem.icon && (
							<span className={styles.icon} aria-hidden="true">
								{menuItem.icon}
							</span>
						)}
						<span className={styles.label}>{menuItem.label}</span>
					</NavLink>
				);
			})}
		</nav>
	);
};
