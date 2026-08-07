import { DATABASE_ROOT, DATABASE_TARGET_ENV } from "@/constants";

/**
 * Monta um caminho do Realtime Database com os dois prefixos obrigatórios:
 * o nó do projeto e o do ambiente.
 *
 * O banco é compartilhado com outros apps, então o nó do projeto não é opcional —
 * sem ele, os dados caem na raiz e se misturam. Ver `specs/BACKEND.md`.
 *
 * @example
 * buildDatabasePath("registrations")            // "corrida-bode/staging/registrations"
 * buildDatabasePath("registrations", "abc123")  // "corrida-bode/staging/registrations/abc123"
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

	return [DATABASE_ROOT, DATABASE_TARGET_ENV, ...cleanSegments].join("/");
};
