/**
 * Estados possíveis da autenticação.
 *
 * São três, não dois. "Não está logado" e "ainda não sei se está logado" parecem
 * a mesma coisa e não são: o Firebase restaura a sessão de forma assíncrona, então
 * existe um instante depois de carregar a página em que a resposta é desconhecida.
 * Tratar esse instante como `anonymous` faz a tela de login piscar na cara de quem
 * já estava logado.
 */
export const AUTH_STATUS = {
	/** Ainda verificando se existe sessão salva. */
	loading: "loading",
	/** Verificado: ninguém logado. */
	anonymous: "anonymous",
	/** Verificado: tem alguém logado. */
	authenticated: "authenticated",
};
