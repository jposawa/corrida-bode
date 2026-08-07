import { Route, Routes } from "react-router-dom";

import { NAVIGATION_PAGES } from "@/constants";

import { Event } from "./Event";
import { Home } from "./Home";
import { NotFound } from "./NotFound";
import { Registration } from "./Registration";

/**
 * Registro de rotas do app.
 *
 * Os caminhos vêm de `NAVIGATION_PAGES` — o mesmo objeto que monta o menu.
 * Assim não existe a chance de o menu apontar para uma rota que não existe.
 *
 * A rota `*` no fim é obrigatória por causa do `public/_redirects`: no Netlify
 * qualquer endereço entrega o index.html, então quem trata endereço inválido é
 * o react-router, não o servidor.
 */
export const AppRouter = () => {
	return (
		<Routes>
			<Route path={NAVIGATION_PAGES.home.path} element={<Home />} />
			<Route
				path={NAVIGATION_PAGES.registration.path}
				element={<Registration />}
			/>
			<Route path={NAVIGATION_PAGES.event.path} element={<Event />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
};
