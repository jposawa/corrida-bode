import { NAVIGATION_PAGES } from "@/constants";
import { Route } from "react-router-dom";
import { Contact, Home } from ".";
import { Routes } from "react-router-dom";

export const AppRouter = () => {
	return (
		<Routes>
			<Route path={NAVIGATION_PAGES.home.path} element={<Home />} />
			<Route path={NAVIGATION_PAGES.home.altPath} element={<Home />} />
			<Route path={NAVIGATION_PAGES.contact.path} element={<Contact />} />
		</Routes>
	);
};
