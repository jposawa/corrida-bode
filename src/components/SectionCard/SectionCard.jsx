import clsx from "clsx";

import styles from "./SectionCard.module.css";

/**
 * Bloco de conteúdo elevado, com título opcional.
 * Serve de moldura para seções de página — não sabe nada do que tem dentro.
 *
 * @param {Object} props
 * @param {string} [props.title]
 * @param {JSX.Element} [props.icon] - Ícone exibido ao lado do título
 * @param {"neutral" | "primary" | "secondary" | "warning"} [props.intent]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export const SectionCard = ({
	title,
	icon,
	intent = "neutral",
	children,
	className,
}) => {
	return (
		<section className={clsx(styles.card, styles[intent], className)}>
			{title && (
				<h2 className={styles.title}>
					{/* aria-hidden: o ícone é decorativo, o texto ao lado já diz tudo.
					    Sem isso, o leitor de tela pode anunciar um símbolo sem sentido. */}
					{icon && (
						<span className={styles.icon} aria-hidden="true">
							{icon}
						</span>
					)}
					{title}
				</h2>
			)}
			{children}
		</section>
	);
};
