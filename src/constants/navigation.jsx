import { GoHomeFill } from "react-icons/go";

/**
 * @typedef {Object} NavigationItem
 * @property {string} key - Unique key for the navigation item
 * @property {string} path - The page route
 * @property {string} label - The page label
 * @property {number} order - The order of the page in navigation
 * @property {Element} [icon] - Optional icon for the page
 * @property {string} [altPath] - Optional alternative path for the page
 */

/**
 * @typedef {Record<string, NavigationItem>} NAVIGATION_PAGES
 */

/**
 * @type {NAVIGATION_PAGES}
 */
export const NAVIGATION_PAGES = {
	home: {
		path: "/",
		label: "Home",
		order: 0,
		icon: <GoHomeFill />,
	},
	contact: {
		path: "/contact",
		label: "Contact",
		order: 1,
	},
};
