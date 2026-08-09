import { onlyDigits } from "./format";

/**
 * Confere os campos obrigatórios. Ajuda quem preenche — não protege nada:
 * quem quiser burlar chama a API direto. Ver specs/BACKEND.md.
 *
 * @param {Object} values
 * @returns {Record<string, string>} Erros por campo. Vazio = tudo certo
 */
export const validateRegistration = (values) => {
	const errors = {};

	if (!values.fullName?.trim()) {
		errors.fullName = "Informe seu nome completo";
	} else if (!values.fullName.trim().includes(" ")) {
		errors.fullName = "Informe nome e sobrenome";
	}

	const phoneDigits = onlyDigits(values.phone);

	if (!phoneDigits) {
		errors.phone = "Informe seu telefone";
	} else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
		errors.phone = "Telefone deve ter DDD + número";
	}

	if (!values.city?.trim()) {
		errors.city = "Informe sua cidade";
	}

	if (!values.shirtSize) {
		errors.shirtSize = "Escolha o tamanho da camisa";
	}

	if (!values.distance) {
		errors.distance = "Escolha a distância";
	}

	if (!values.paymentMethod) {
		errors.paymentMethod = "Escolha a forma de pagamento";
	}

	if (values.email?.trim() && !values.email.includes("@")) {
		errors.email = "E-mail inválido";
	}

	return errors;
};
