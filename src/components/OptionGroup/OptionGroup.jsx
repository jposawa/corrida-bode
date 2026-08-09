import clsx from "clsx";

import styles from "./OptionGroup.module.css";

/**
 * Escolha única em cartões. Usa `<input type="radio">` escondido para manter
 * navegação por teclado e leitor de tela.
 *
 * @param {Object} props
 * @param {string} props.name - Único na página
 * @param {string} props.label
 * @param {Array<{ value: string | number, label: string, description?: string }>} props.options
 * @param {string | number} [props.value]
 * @param {(value: string | number) => void} props.onChange
 * @param {string} [props.errorMessage]
 * @param {boolean} [props.isOptional]
 * @param {string} [props.className]
 */
export const OptionGroup = ({
	name,
	label,
	options,
	value,
	onChange,
	errorMessage,
	isOptional = false,
	className,
}) => {
	const hasError = Boolean(errorMessage);

	const handleOptionChange = (event) => {
		// value do input é sempre string, mesmo com opção numérica (3, 5, 10).
		const selectedOption = options.find((option) => {
			return String(option.value) === event.target.value;
		});

		if (selectedOption) {
			onChange(selectedOption.value);
		}
	};

	return (
		<fieldset className={clsx(styles.group, className)}>
			<legend className={styles.legend}>
				{label}
				{isOptional && <span className={styles.optionalTag}> (opcional)</span>}
			</legend>

			<div className={styles.options}>
				{options.map((option) => {
					const isSelected = String(option.value) === String(value);

					return (
						<label
							key={option.value}
							className={clsx(
								styles.option,
								isSelected && styles.selected,
								hasError && styles.error,
							)}
						>
							<input
								type="radio"
								name={name}
								value={option.value}
								checked={isSelected}
								onChange={handleOptionChange}
								className={styles.radio}
							/>
							<span className={styles.optionLabel}>{option.label}</span>
							{option.description && (
								<span className={styles.optionDescription}>
									{option.description}
								</span>
							)}
						</label>
					);
				})}
			</div>

			{hasError && (
				<span className={styles.errorMessage} role="alert">
					{errorMessage}
				</span>
			)}
		</fieldset>
	);
};
