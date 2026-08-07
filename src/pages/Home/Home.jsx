import { Link } from "react-router-dom";
import { FaPersonRunning } from "react-icons/fa6";
import { MdOutlineVolunteerActivism, MdPayments } from "react-icons/md";

import { SectionCard } from "@/components";
import {
	DONATION_WEIGHT_KG,
	NAVIGATION_PAGES,
	RACE_DISTANCE_OPTIONS,
} from "@/constants";

import styles from "./Home.module.css";

/**
 * Página inicial: apresenta a corrida e leva para a inscrição.
 *
 * As duas condições para correr (pagamento + doação) aparecem aqui de propósito,
 * antes do formulário — quem chega precisa saber o combinado antes de preencher.
 */
export const Home = () => {
	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<span className={styles.kicker}>Inscrições abertas</span>
				<h1 className={styles.title}>Corrida do Bode</h1>
				<p className={styles.subtitle}>
					Escolha sua distância, garanta sua camisa e ajude quem precisa. Cada
					inscrição vale {DONATION_WEIGHT_KG} kg de alimentos.
				</p>

				<Link
					to={NAVIGATION_PAGES.registration.path}
					className={styles.callToAction}
				>
					<FaPersonRunning aria-hidden="true" />
					Fazer minha inscrição
				</Link>
			</section>

			<SectionCard title="Distâncias">
				<ul className={styles.distanceList}>
					{RACE_DISTANCE_OPTIONS.map((distance) => {
						return (
							<li key={distance.value} className={styles.distanceItem}>
								<span className={styles.distanceValue}>{distance.label}</span>
								<span className={styles.distanceDescription}>
									{distance.description}
								</span>
							</li>
						);
					})}
				</ul>
			</SectionCard>

			<SectionCard
				title="Como funciona"
				icon={<MdPayments />}
				intent="primary"
			>
				<p>
					Para correr, duas coisas precisam estar confirmadas — e elas acontecem
					em momentos diferentes:
				</p>

				<ol className={styles.stepList}>
					<li className={styles.step}>
						<span className={styles.stepIcon} aria-hidden="true">
							<MdPayments />
						</span>
						<div>
							<strong>Pagamento</strong>
							<p className={styles.stepText}>
								Via Pix ou cartão. A organização confirma o recebimento e sua
								inscrição muda para aprovada.
							</p>
						</div>
					</li>

					<li className={styles.step}>
						<span className={styles.stepIcon} aria-hidden="true">
							<MdOutlineVolunteerActivism />
						</span>
						<div>
							<strong>Doação de {DONATION_WEIGHT_KG} kg de alimentos</strong>
							<p className={styles.stepText}>
								Entregue no local, no dia da corrida. Não precisa enviar antes.
							</p>
						</div>
					</li>
				</ol>

				<p className={styles.warning}>
					Só participa da corrida quem tiver o pagamento aprovado <em>e</em> a
					doação entregue.
				</p>
			</SectionCard>

			<SectionCard title="Ainda vem mais informação">
				<p>
					Endereço do local, horário da largada e como será o evento serão
					publicados na página{" "}
					<Link to={NAVIGATION_PAGES.event.path} className={styles.inlineLink}>
						{NAVIGATION_PAGES.event.label}
					</Link>
					.
				</p>
			</SectionCard>
		</main>
	);
};
