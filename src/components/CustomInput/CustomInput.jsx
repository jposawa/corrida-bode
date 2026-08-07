/* eslint-disable react/display-name */
import React from "react";

import clsx from "clsx";

import styles from "./CustomInput.module.css";

/**
 * Campo de texto com rótulo, dica e mensagem de erro.
 *
 * O `<input>` fica DENTRO do `<label>`. Isso já associa os dois para leitores de
 * tela — sem precisar casar `id` com `htmlFor` na mão.
 *
 * @param {Object} inputProps
 * @param {"primary" | "secondary" | "error"} [inputProps.intent]
 * @param {"filled" | "outlined"} [inputProps.variant]
 * @param {string} [inputProps.label] - Texto do rótulo
 * @param {string} [inputProps.hint] - Dica curta abaixo do campo
 * @param {string} [inputProps.errorMessage] - Se preenchido, o campo vira estado de erro
 * @param {boolean} [inputProps.isOptional] - Marca o campo como opcional no rótulo
 * @param {string} [inputProps.className] - Vai no wrapper, para o container ajustar o layout
 * @param {string} [inputProps.inputClassName] - Vai no `<input>`, para ajustar o visual do campo
 */
export const CustomInput = React.forwardRef((inputProps, ref) => {
	const {
		intent,
		variant = "filled",
		label,
		hint,
		errorMessage,
		isOptional = false,
		className,
		inputClassName,
		...props
	} = inputProps;

	// useId gera um id único e estável. Serve para o aria-describedby apontar
	// para a mensagem certa quando existem vários campos na mesma tela.
	const generatedId = React.useId();
	const errorId = `${generatedId}-error`;
	const hintId = `${generatedId}-hint`;

	const hasError = Boolean(errorMessage);
	// Erro sempre ganha da intenção passada por fora — senão um campo inválido
	// poderia continuar pintado de "primary" e ninguém veria o problema.
	const appliedIntent = hasError ? "error" : intent;

	/**
	 * O aria-describedby aponta para UM id: o da mensagem de erro, se houver;
	 * senão o da dica; senão nenhum.
	 */
	const getDescribedById = () => {
		if (hasError) {
			return errorId;
		}

		if (hint) {
			return hintId;
		}

		return undefined;
	};

	return (
		/* O className externo vai no wrapper: layout é responsabilidade do
		   container, e é o wrapper que é filho do grid. Ver specs/STANDARDS.md. */
		<label className={clsx(styles.field, className)}>
			{label && (
				<span className={styles.label}>
					{label}
					{isOptional && (
						<span className={styles.optionalTag}> (opcional)</span>
					)}
				</span>
			)}

			<input
				ref={ref}
				className={clsx(
					styles.input,
					styles[variant],
					appliedIntent && styles[appliedIntent],
					inputClassName,
				)}
				aria-invalid={hasError}
				aria-describedby={getDescribedById()}
				{...props}
			/>

			{hasError && (
				<span id={errorId} className={styles.errorMessage} role="alert">
					{errorMessage}
				</span>
			)}

			{!hasError && hint && (
				<span id={hintId} className={styles.hint}>
					{hint}
				</span>
			)}
		</label>
	);
});
