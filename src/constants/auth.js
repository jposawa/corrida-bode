/**
 * `loading` é separado de `anonymous` porque o Firebase restaura a sessão de
 * forma assíncrona — tratar os dois como um só faz a tela de login piscar para
 * quem já estava logado.
 */
export const AUTH_STATUS = {
	loading: "loading",
	anonymous: "anonymous",
	authenticated: "authenticated",
};
