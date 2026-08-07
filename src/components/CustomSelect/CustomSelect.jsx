/* eslint-disable react/display-name */
import React from "react";

import clsx from "clsx";

import styles from "./CustomSelect.module.css";

/**
 * Lista suspensa de escolha única.
 *
 * Usar quando as opções forem muitas ou secundárias. Para escolhas curtas e
 * importantes (tamanho da camisa, distância), o `OptionGroup` mostra tudo de uma
 * vez e dá menos trabalho para quem preenche pelo celular.
 *
 * @param {Object} selectProps
 * @param {string} [selectProps.label]
 * @param {Array<{ value: string | number, label: string }>} selectProps.options
 * @param {string} [selectProps.placeholder] - Texto da opção vazia inicial
 * @param {string} [selectProps.errorMessage]
 * @param {boolean} [selectProps.isOptional]
 * @param {string} [selectProps.className] - Vai no wrapper, para o container ajustar o layout
 * @param {string} [selectProps.selectClassName] - Vai no `<select>`
 */
export const CustomSelect = React.forwardRef((selectProps, ref) => {
	const {
		label,
		options,
		placeholder = "Selecione...",
		errorMessage,
		isOptional = false,
		className,
		selectClassName,
		...props
	} = selectProps;

	const generatedId = React.useId();
	const errorId = `${generatedId}-error`;
	const hasError = Boolean(errorMessage);

	return (
		<label className={clsx(styles.field, className)}>
			{label && (
				<span className={styles.label}>
					{label}
					{isOptional && (
						<span className={styles.optionalTag}> (opcional)</span>
					)}
				</span>
			)}

			<select
				ref={ref}
				className={clsx(
					styles.select,
					hasError && styles.error,
					selectClassName,
				)}
				aria-invalid={hasError}
				aria-describedby={hasError ? errorId : undefined}
				{...props}
			>
				<option value="">{placeholder}</option>
				{options.map((option) => {
					return (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					);
				})}
			</select>

			{hasError && (
				<span id={errorId} className={styles.errorMessage} role="alert">
					{errorMessage}
				</span>
			)}
		</label>
	);
});
