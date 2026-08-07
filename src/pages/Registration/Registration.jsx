import React from "react";
import { FcGoogle } from "react-icons/fc";
import { MdCheckCircle, MdInfoOutline, MdLock } from "react-icons/md";

import { CustomButton, SectionCard } from "@/components";
import { RegistrationForm } from "@/fragments";
import { formatDistance, formatPhone } from "@/helpers";
import { useAuth } from "@/hooks";

import styles from "./Registration.module.css";

/**
 * Página de inscrição.
 *
 * ATENÇÃO — ainda não grava nada. O formulário valida e monta os dados, mas o
 * envio para o Firebase depende do login com Google, que é o próximo passo.
 * Por enquanto a página mostra o que SERIA enviado, para dar para conferir o
 * formato antes de ligar o banco. Ver `specs/BACKEND.md`.
 */
export const Registration = () => {
	const [submittedValues, setSubmittedValues] = React.useState(null);
	const { isAuthenticated, isCheckingAuth, isProcessing, errorMessage, signIn } =
		useAuth();

	const handleRegistrationSubmit = (values) => {
		setSubmittedValues(values);
		// Leva de volta ao topo — senão a confirmação aparece fora da tela
		// e parece que nada aconteceu.
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleNewRegistration = () => {
		setSubmittedValues(null);
	};

	// Ainda conferindo a sessão salva. Sem este passo, quem já está logado veria
	// a tela de login piscar antes do formulário aparecer.
	if (isCheckingAuth) {
		return (
			<main className={styles.page}>
				<p className={styles.checkingAuth}>Verificando seu login...</p>
			</main>
		);
	}

	if (!isAuthenticated) {
		return (
			<main className={styles.page}>
				<SectionCard title="Entre para se inscrever" icon={<MdLock />}>
					<p>
						A inscrição fica ligada à sua conta Google. É assim que você
						consegue voltar depois e acompanhar se o pagamento e a doação já
						foram confirmados.
					</p>

					<CustomButton intent="primary" onClick={signIn} disabled={isProcessing}>
						<FcGoogle aria-hidden="true" />
						{isProcessing ? "Entrando..." : "Entrar com Google"}
					</CustomButton>

					{errorMessage && (
						<span className={styles.errorMessage} role="alert">
							{errorMessage}
						</span>
					)}
				</SectionCard>

				<SectionCard title="Não tem conta Google?">
					<p>
						Fale com a organização — ela consegue fazer a inscrição por você no
						dia.
					</p>
				</SectionCard>
			</main>
		);
	}

	if (submittedValues) {
		return (
			<main className={styles.page}>
				<SectionCard
					title="Dados recebidos"
					icon={<MdCheckCircle />}
					intent="secondary"
				>
					<p>
						O formulário passou na validação. Confira o resumo abaixo.
					</p>

					<dl className={styles.summary}>
						<div className={styles.summaryRow}>
							<dt>Nome</dt>
							<dd>{submittedValues.fullName}</dd>
						</div>
						<div className={styles.summaryRow}>
							<dt>Telefone</dt>
							<dd>{formatPhone(submittedValues.phone)}</dd>
						</div>
						<div className={styles.summaryRow}>
							<dt>Cidade</dt>
							<dd>{submittedValues.city}</dd>
						</div>
						<div className={styles.summaryRow}>
							<dt>Camisa</dt>
							<dd>{submittedValues.shirtSize}</dd>
						</div>
						<div className={styles.summaryRow}>
							<dt>Distância</dt>
							<dd>{formatDistance(submittedValues.distance)}</dd>
						</div>
						<div className={styles.summaryRow}>
							<dt>Pagamento</dt>
							<dd>
								{submittedValues.paymentMethod === "pix" ? "Pix" : "Cartão"}
							</dd>
						</div>
					</dl>
				</SectionCard>

				<SectionCard
					title="Ainda não foi salvo"
					icon={<MdInfoOutline />}
					intent="warning"
				>
					<p>
						Esta tela é a base visual. A gravação no Firebase entra junto com o
						login pelo Google — sem ele não há como saber de quem é a inscrição,
						nem como as regras de segurança do banco decidem quem lê o quê.
					</p>
				</SectionCard>

				<CustomButton variant="outlined" onClick={handleNewRegistration}>
					Preencher de novo
				</CustomButton>
			</main>
		);
	}

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.title}>Inscrição</h1>
				<p className={styles.subtitle}>
					Os campos sem a marca <em>(opcional)</em> são obrigatórios.
				</p>
			</header>

			<RegistrationForm onSubmit={handleRegistrationSubmit} />
		</main>
	);
};
