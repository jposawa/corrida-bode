import React from "react";
import { MdOutlineVolunteerActivism } from "react-icons/md";

import {
	CustomButton,
	CustomInput,
	CustomSelect,
	OptionGroup,
	SectionCard,
} from "@/components";
import {
	DONATION_WEIGHT_KG,
	GENDER_OPTIONS,
	PAYMENT_METHOD_OPTIONS,
	RACE_DISTANCE_OPTIONS,
	SHIRT_SIZE_OPTIONS,
} from "@/constants";
import { maskPhoneInput, validateRegistration } from "@/helpers";

import styles from "./RegistrationForm.module.css";

const EMPTY_FORM_VALUES = {
	// obrigatórios
	fullName: "",
	phone: "",
	city: "",
	shirtSize: "",
	distance: "",
	paymentMethod: "",
	// opcionais
	heightCm: "",
	weightKg: "",
	age: "",
	gender: "",
	email: "",
};

/**
 * @param {Object} props
 * @param {(values: Object) => void} [props.onSubmit] - Recebe os dados já validados
 */
export const RegistrationForm = ({ onSubmit }) => {
	const [formValues, setFormValues] = React.useState(EMPTY_FORM_VALUES);
	const [errors, setErrors] = React.useState({});
	// Só mostra erro depois da primeira tentativa de envio. Pintar o formulário
	// de vermelho antes da pessoa tentar enviar é hostil.
	const [hasTriedSubmit, setHasTriedSubmit] = React.useState(false);

	/**
	 * Atualiza um campo do formulário.
	 * Recebe nome e valor em vez do evento inteiro porque o OptionGroup entrega
	 * só o valor — assim os dois tipos de campo usam o mesmo caminho.
	 */
	const updateField = (fieldName, fieldValue) => {
		// Monta o próximo estado uma vez só e usa ele nos dois lugares. Se cada um
		// calculasse o seu, a validação rodaria em cima do valor antigo.
		const nextValues = { ...formValues, [fieldName]: fieldValue };

		setFormValues(nextValues);

		if (hasTriedSubmit) {
			// Revalida enquanto digita, mas só depois do primeiro envio: o erro
			// some assim que a pessoa corrige, sem precisar tentar enviar de novo.
			setErrors(validateRegistration(nextValues));
		}
	};

	const handleTextInputChange = (event) => {
		updateField(event.target.name, event.target.value);
	};

	const handlePhoneChange = (event) => {
		updateField("phone", maskPhoneInput(event.target.value));
	};

	// Handlers nomeados em vez de arrow inline no JSX: o OptionGroup entrega só o
	// valor, e um nome explícito diz qual campo está mudando. Ver specs/STANDARDS.md.
	const handleShirtSizeChange = (shirtSize) => {
		updateField("shirtSize", shirtSize);
	};

	const handleDistanceChange = (distance) => {
		updateField("distance", distance);
	};

	const handlePaymentMethodChange = (paymentMethod) => {
		updateField("paymentMethod", paymentMethod);
	};

	const handleFormSubmit = (event) => {
		// Sem isto o navegador recarrega a página e perde tudo que foi digitado.
		event.preventDefault();
		setHasTriedSubmit(true);

		const validationErrors = validateRegistration(formValues);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		onSubmit?.(formValues);
	};

	const errorCount = Object.keys(errors).length;
	const shouldShowErrorSummary = hasTriedSubmit && errorCount > 0;

	return (
		<form className={styles.form} onSubmit={handleFormSubmit} noValidate>
			{shouldShowErrorSummary && (
				<div className={styles.errorSummary} role="alert">
					{errorCount === 1
						? "Falta 1 campo obrigatório."
						: `Faltam ${errorCount} campos obrigatórios.`}
				</div>
			)}

			<SectionCard title="Seus dados">
				<div className={styles.fieldGrid}>
					<CustomInput
						name="fullName"
						label="Nome completo"
						placeholder="Maria da Silva"
						autoComplete="name"
						value={formValues.fullName}
						onChange={handleTextInputChange}
						errorMessage={errors.fullName}
						className={styles.fullWidth}
					/>

					<CustomInput
						name="phone"
						label="Telefone"
						placeholder="(11) 98765-4321"
						inputMode="tel"
						autoComplete="tel"
						value={formValues.phone}
						onChange={handlePhoneChange}
						errorMessage={errors.phone}
						hint="Com DDD. É por aqui que a organização fala com você."
					/>

					<CustomInput
						name="city"
						label="Cidade"
						placeholder="São Paulo"
						autoComplete="address-level2"
						value={formValues.city}
						onChange={handleTextInputChange}
						errorMessage={errors.city}
					/>
				</div>
			</SectionCard>

			<SectionCard title="Sua corrida">
				<OptionGroup
					name="shirtSize"
					label="Tamanho da camisa"
					options={SHIRT_SIZE_OPTIONS}
					value={formValues.shirtSize}
					onChange={handleShirtSizeChange}
					errorMessage={errors.shirtSize}
				/>

				<OptionGroup
					name="distance"
					label="Distância"
					options={RACE_DISTANCE_OPTIONS}
					value={formValues.distance}
					onChange={handleDistanceChange}
					errorMessage={errors.distance}
				/>
			</SectionCard>

			<SectionCard
				title="Pagamento e doação"
				icon={<MdOutlineVolunteerActivism />}
				intent="primary"
			>
				<OptionGroup
					name="paymentMethod"
					label="Forma de pagamento"
					options={PAYMENT_METHOD_OPTIONS}
					value={formValues.paymentMethod}
					onChange={handlePaymentMethodChange}
					errorMessage={errors.paymentMethod}
				/>

				<p className={styles.donationNote}>
					Além do pagamento, leve <strong>{DONATION_WEIGHT_KG} kg de
					alimentos</strong> no dia da corrida, no local do evento. A doação é
					recebida lá — não precisa enviar antes.
				</p>

				<p className={styles.warning}>
					Só participa quem tiver o pagamento aprovado <em>e</em> a doação
					entregue.
				</p>
			</SectionCard>

			<SectionCard title="Dados opcionais">
				<p className={styles.optionalIntro}>
					Ajudam a organização a planejar o evento. Pode pular qualquer um —
					nenhum deles impede a inscrição.
				</p>

				<div className={styles.fieldGrid}>
					<CustomInput
						name="age"
						label="Idade"
						type="number"
						inputMode="numeric"
						min="0"
						max="120"
						placeholder="32"
						isOptional
						value={formValues.age}
						onChange={handleTextInputChange}
					/>

					<CustomSelect
						name="gender"
						label="Sexo"
						options={GENDER_OPTIONS}
						isOptional
						value={formValues.gender}
						onChange={handleTextInputChange}
					/>

					<CustomInput
						name="heightCm"
						label="Altura (cm)"
						type="number"
						inputMode="numeric"
						min="0"
						max="250"
						placeholder="165"
						isOptional
						value={formValues.heightCm}
						onChange={handleTextInputChange}
					/>

					<CustomInput
						name="weightKg"
						label="Peso (kg)"
						type="number"
						inputMode="decimal"
						min="0"
						max="300"
						placeholder="62"
						isOptional
						value={formValues.weightKg}
						onChange={handleTextInputChange}
					/>

					<CustomInput
						name="email"
						label="E-mail"
						type="email"
						autoComplete="email"
						placeholder="maria@email.com"
						isOptional
						value={formValues.email}
						onChange={handleTextInputChange}
						errorMessage={errors.email}
						className={styles.fullWidth}
					/>
				</div>
			</SectionCard>

			<CustomButton type="submit" intent="primary" className={styles.submit}>
				Enviar inscrição
			</CustomButton>
		</form>
	);
};
