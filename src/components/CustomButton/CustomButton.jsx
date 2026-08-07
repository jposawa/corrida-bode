/* eslint-disable react/display-name */
import React from "react";

import clsx from "clsx";

import styles from "./CustomButton.module.css";

/**
 * @param {Object} CustomButtonProps
 * @param {"primary" | "secondary" | "error"} [CustomButtonProps.intent]
 * @param {"filled" | "outlined"} [CustomButtonProps.variant]
 * @param {string} [CustomButtonProps.label]
 * @param {string} [CustomButtonProps.className]
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} [CustomButtonProps.props]
 */
export const CustomButton = React.forwardRef((CustomButtonProps, ref) => {
	const {
		intent,
		variant = "filled",
    type = "button",
		children,
		className,
		...props
	} = CustomButtonProps;

	return (
		<button
			ref={ref}
      type={type}
			className={clsx(
				styles.button,
				styles[variant],
				intent && styles[intent],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
});
