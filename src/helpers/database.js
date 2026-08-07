import { DATABASE_TARGET_ENV } from "@/constants";

/**
 * Monta um caminho do Realtime Database já com o prefixo do ambiente.
 *
 * @example
 * buildDatabasePath("registrations")            // "staging/registrations"
 * buildDatabasePath("registrations", "abc123")  // "staging/registrations/abc123"
 *
 * @param {...(string | number)} segments - Pedaços do caminho, na ordem
 * @returns {string} Caminho completo
 */
export const buildDatabasePath = (...segments) => {
	const cleanSegments = segments.filter((segment) => {
		// Descarta undefined/null/"" — um segmento vazio vira "//" no caminho,
		// e o Firebase rejeita isso com um erro pouco óbvio.
		return segment !== undefined && segment !== null && segment !== "";
	});

	return [DATABASE_TARGET_ENV, ...cleanSegments].join("/");
};
