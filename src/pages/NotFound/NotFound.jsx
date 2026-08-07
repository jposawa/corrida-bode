import { Link } from "react-router-dom";

import { NAVIGATION_PAGES } from "@/constants";

import styles from "./NotFound.module.css";

/**
 * Página para rota inexistente.
 *
 * Precisa existir por causa do `public/_redirects`: no Netlify, QUALQUER caminho
 * entrega o index.html. Sem uma rota curinga aqui, digitar um endereço errado
 * mostraria uma tela em branco em vez de um aviso.
 */
export const NotFound = () => {
	return (
		<main className={styles.page}>
			<h1 className={styles.title}>Página não encontrada</h1>
			<p className={styles.text}>
				O endereço digitado não existe neste app.
			</p>

			<Link to={NAVIGATION_PAGES.home.path} className={styles.link}>
				Voltar para o início
			</Link>
		</main>
	);
};
