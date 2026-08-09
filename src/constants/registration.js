/**
 * Listas fechadas da inscrição.
 *
 * Todo valor que o formulário aceita mora aqui, num lugar só. Espalhar a string
 * `"GG"` por cinco arquivos significa que um erro de digitação não dá erro nenhum —
 * só para de funcionar em silêncio. Ver `specs/STANDARDS.md`.
 *
 * `value` é o que vai para o banco (inglês/código). `label` é o que a pessoa vê (pt-br).
 */

/** Peso de alimentos exigido como doação, em quilos. */
export const DONATION_WEIGHT_KG = 2;

/**
 * @typedef {Object} SelectOption
 * @property {string | number} value - Valor gravado no banco
 * @property {string} label - Texto mostrado na tela
 * @property {string} [description] - Detalhe opcional, exibido menor
 */

/** @type {SelectOption[]} */
export const SHIRT_SIZE_OPTIONS = [
	{ value: "P", label: "P", description: "Pequeno" },
	{ value: "M", label: "M", description: "Médio" },
	{ value: "G", label: "G", description: "Grande" },
	{ value: "GG", label: "GG", description: "Extra grande" },
];

/**
 * Distância é número, não texto: `5`, nunca `"5km"`.
 * Assim dá para ordenar e comparar sem ficar fatiando string.
 * O "km" entra só na hora de mostrar.
 *
 * @type {SelectOption[]}
 */
export const RACE_DISTANCE_OPTIONS = [
	{ value: 3, label: "3 km", description: "Caminhada / iniciante" },
	{ value: 5, label: "5 km", description: "Intermediário" },
	{ value: 10, label: "10 km", description: "Avançado" },
];

/** @type {SelectOption[]} */
export const GENDER_OPTIONS = [
	{ value: "female", label: "Feminino" },
	{ value: "male", label: "Masculino" },
	{ value: "other", label: "Outro" },
	{ value: "unspecified", label: "Prefiro não informar" },
];

/** @type {SelectOption[]} */
export const PAYMENT_METHOD_OPTIONS = [
	{ value: "pix", label: "Pix" },
	{ value: "card", label: "Cartão" },
];

/**
 * Situação do pagamento. Só a organização altera este campo —
 * é regra de segurança, não convenção. Ver `specs/BACKEND.md`.
 */
export const PAYMENT_STATUS = {
	pending: "pending",
	approved: "approved",
	rejected: "rejected",
};

