import clsx from "clsx";

import styles from "./Toggle.module.css";

/**
 * Interruptor de liga/desliga.
 *
 * @param {Object} props
 * @param {boolean} props.isChecked
 * @param {(isChecked: boolean) => void} props.onChange
 * @param {string} props.label - Descreve o que o interruptor liga. Vira aria-label
 * @param {JSX.Element} [props.iconOff]
 * @param {JSX.Element} [props.iconOn]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
export const Toggle = ({
	isChecked,
	onChange,
	label,
	iconOff,
	iconOn,
	disabled = false,
	className,
}) => {
	const handleToggle = () => {
		onChange(!isChecked);
	};

	return (
		<button
			type="button"
			role="switch"
			aria-checked={isChecked}
			aria-label={label}
			disabled={disabled}
			onClick={handleToggle}
			className={clsx(styles.toggle, isChecked && styles.checked, className)}
		>
			{iconOff && <span className={styles.iconOff}>{iconOff}</span>}
			{iconOn && <span className={styles.iconOn}>{iconOn}</span>}
			<span className={styles.thumb} />
		</button>
	);
};
