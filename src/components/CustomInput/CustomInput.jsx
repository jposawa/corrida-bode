/* eslint-disable react/display-name */
import React from "react";

import clsx from "clsx";

import styles from "./CustomInput.module.css";

/**
 * @param {Object} CustomInputProps
 * @param {"primary" | "secondary" | "error"} [inputProps.intent]
 * @param {"filled" | "outlined"} [inputProps.variant]
 * @param {string} [inputProps.label]
 * @param {string} [inputProps.className]
 * @param {React.InputHTMLAttributes<HTMLInputElement>} [inputProps.props]
 */
export const CustomInput = React.forwardRef((inputProps, ref) => {
	const { intent, variant = "filled", label, className, ...props } = inputProps;

	return (
		<label className={styles.field}>
			{label && <span className={styles.label}>{label}</span>}
			<input
				ref={ref}
				className={clsx(
					styles.input,
					styles[variant],
					intent && styles[intent],
					className,
				)}
				{...props}
			/>
		</label>
	);
});
