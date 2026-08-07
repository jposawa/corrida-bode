import { PAYMENT_STATUS } from "@/constants";
import { onlyDigits } from "./format";

/**
 * @typedef {Object} RegistrationFormValues
 * @property {string} fullName
 * @property {string} phone
 * @property {string} city
 * @property {string} shirtSize
 * @property {number | string} distance
 * @property {string} [heightCm]
 * @property {string} [weightKg]
 * @property {string} [age]
 * @property {string} [gender]
 * @property {string} [email]
 * @property {string} [paymentMethod]
 */

/**
 * Confere os campos obrigatórios do formulário.
 *
 * Isto existe para AJUDAR quem preenche — não protege nada. Quem quiser burlar
 * chama a API direto, sem passar por aqui. Quem protege são as regras do
 * Realtime Database. Ver `specs/BACKEND.md`.
 *
 * @param {RegistrationFormValues} values
 * @returns {Record<string, string>} Erros por campo. Objeto vazio = tudo certo.
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

	// E-mail é opcional — mas se foi preenchido, precisa parecer um e-mail.
	if (values.email?.trim() && !values.email.includes("@")) {
		errors.email = "E-mail inválido";
	}

	return errors;
};

/**
 * A pessoa está liberada para correr?
 *
 * São duas condições independentes, confirmadas em momentos diferentes.
 * Este valor é CALCULADO, nunca gravado no banco: campo derivado que fica salvo
 * desatualiza em silêncio quando uma das duas fontes muda. Ver `specs/DOMAIN.md`.
 *
 * @param {Object} registration
 * @returns {boolean}
 */
export const getIsClearedToRun = (registration) => {
	if (!registration) {
		return false;
	}

	return (
		registration.paymentStatus === PAYMENT_STATUS.approved &&
		registration.isDonationDelivered === true
	);
};

/**
 * O que ainda falta para a pessoa poder correr.
 * Serve para a tela dizer exatamente o que cobrar, em vez de só "pendente".
 *
 * @param {Object} registration
 * @returns {string[]} Lista de pendências, em pt-br. Vazia = tudo certo.
 */
export const getPendingRequirements = (registration) => {
	if (!registration) {
		return ["Inscrição não encontrada"];
	}

	const pending = [];

	if (registration.paymentStatus !== PAYMENT_STATUS.approved) {
		pending.push("Confirmação do pagamento");
	}

	if (!registration.isDonationDelivered) {
		pending.push("Entrega dos 2 kg de alimentos");
	}

	return pending;
};
