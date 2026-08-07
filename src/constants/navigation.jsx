import { GoHomeFill } from "react-icons/go";
import { FaPersonRunning } from "react-icons/fa6";
import { MdEvent } from "react-icons/md";

/**
 * @typedef {Object} NavigationItem
 * @property {string} path - A rota da página
 * @property {string} label - O texto que aparece no menu
 * @property {number} order - Posição no menu
 * @property {JSX.Element} [icon] - Ícone opcional
 * @property {string} [altPath] - Caminho alternativo que leva à mesma página
 */

/**
 * Registro único das páginas navegáveis.
 * O menu e o roteador leem daqui — assim os dois nunca ficam fora de sincronia.
 *
 * @type {Record<string, NavigationItem>}
 */
export const NAVIGATION_PAGES = {
	home: {
		path: "/",
		label: "Início",
		order: 0,
		icon: <GoHomeFill />,
	},
	registration: {
		path: "/inscricao",
		label: "Inscrição",
		order: 1,
		icon: <FaPersonRunning />,
	},
	event: {
		path: "/evento",
		label: "O evento",
		order: 2,
		icon: <MdEvent />,
	},
};
