import clsx from "clsx";

import styles from "./OptionGroup.module.css";

/**
 * Grupo de escolha única, desenhado como cartões clicáveis.
 *
 * Por baixo são `<input type="radio">` de verdade, só escondidos visualmente.
 * Isso mantém de graça o que um `<div>` clicável perderia: navegação por Tab,
 * seleção pelas setas do teclado e leitura correta por leitor de tela.
 *
 * O `<fieldset>` + `<legend>` é o que agrupa as opções semanticamente — sem ele,
 * o leitor de tela anuncia "3 km" sem dizer que a pergunta era a distância.
 *
 * @param {Object} props
 * @param {string} props.name - Nome do grupo. Precisa ser único na página
 * @param {string} props.label - Pergunta mostrada acima das opções
 * @param {Array<{ value: string | number, label: string, description?: string }>} props.options
 * @param {string | number} [props.value] - Opção selecionada agora
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
		const selectedOption = options.find((option) => {
			// O value do input é sempre string, mesmo quando a opção é número (3, 5, 10).
			// Comparar como texto evita o clássico "3" !== 3.
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
