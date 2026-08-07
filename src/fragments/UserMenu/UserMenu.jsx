import { FcGoogle } from "react-icons/fc";
import { MdLogout } from "react-icons/md";

import { CustomButton } from "@/components";
import { useAuth } from "@/hooks";

import styles from "./UserMenu.module.css";

/**
 * Pega as iniciais para o avatar de quem não tem foto no Google.
 *
 * @param {string} [displayName]
 * @returns {string}
 */
const getInitials = (displayName) => {
	if (!displayName) {
		return "?";
	}

	const words = displayName.trim().split(" ");
	const firstLetter = words[0]?.[0] ?? "";
	// Pega a última palavra, não a segunda: "Maria da Silva" vira "MS", não "MD".
	const lastLetter = words.length > 1 ? words[words.length - 1][0] : "";

	return `${firstLetter}${lastLetter}`.toUpperCase();
};

/**
 * Área de login no topo do app.
 *
 * Mostra o botão de entrar, ou o usuário logado com a opção de sair.
 * É fragment, não component: conduz o fluxo de autenticação.
 */
export const UserMenu = () => {
	const {
		currentUser,
		isAuthenticated,
		isCheckingAuth,
		isProcessing,
		errorMessage,
		warningMessage,
		signIn,
		signOut,
	} = useAuth();

	// Enquanto o Firebase não terminou de conferir a sessão salva, não mostra nada.
	// Mostrar "Entrar" aqui faria o botão piscar para quem já estava logado.
	if (isCheckingAuth) {
		return <div className={styles.placeholder} aria-hidden="true" />;
	}

	if (!isAuthenticated) {
		return (
			<div className={styles.container}>
				<CustomButton
					variant="outlined"
					onClick={signIn}
					disabled={isProcessing}
				>
					<FcGoogle aria-hidden="true" />
					{isProcessing ? "Entrando..." : "Entrar com Google"}
				</CustomButton>

				{errorMessage && (
					<span className={styles.errorMessage} role="alert">
						{errorMessage}
					</span>
				)}
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.userInfo}>
				{currentUser.photoURL ? (
					<img
						src={currentUser.photoURL}
						alt=""
						className={styles.avatar}
						referrerPolicy="no-referrer"
					/>
				) : (
					<span className={styles.avatarFallback} aria-hidden="true">
						{getInitials(currentUser.displayName)}
					</span>
				)}

				<span className={styles.userName}>
					{currentUser.displayName || currentUser.email}
				</span>

				<button
					type="button"
					className={styles.signOutButton}
					onClick={signOut}
					disabled={isProcessing}
					aria-label="Sair da conta"
					title="Sair"
				>
					<MdLogout />
				</button>
			</div>

			{warningMessage && (
				<span className={styles.warningMessage} role="alert">
					{warningMessage}
				</span>
			)}

			{errorMessage && (
				<span className={styles.errorMessage} role="alert">
					{errorMessage}
				</span>
			)}
		</div>
	);
};
