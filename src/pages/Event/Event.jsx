import { MdOutlinePendingActions } from "react-icons/md";

import { SectionCard } from "@/components";
import { DONATION_WEIGHT_KG } from "@/constants";

import styles from "./Event.module.css";

/**
 * Página de informações do evento.
 *
 * O conteúdo real (endereço, horário, percurso) ainda não foi definido. Inventar
 * campos antes de ter o conteúdo é decidir errado com confiança, então a página
 * lista o que está pendente em vez de fingir uma estrutura. Ver `specs/DOMAIN.md`.
 */
export const Event = () => {
	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.title}>O evento</h1>
				<p className={styles.subtitle}>
					Tudo que já está definido sobre a corrida.
				</p>
			</header>

			<SectionCard title="Já está definido">
				<ul className={styles.factList}>
					<li>Distâncias de 3 km, 5 km e 10 km</li>
					<li>Camisas nos tamanhos P, M, G e GG</li>
					<li>Pagamento por Pix ou cartão</li>
					<li>
						Doação de {DONATION_WEIGHT_KG} kg de alimentos, entregue no local no
						dia da corrida
					</li>
				</ul>
			</SectionCard>

			<SectionCard
				title="Ainda a definir"
				icon={<MdOutlinePendingActions />}
				intent="warning"
			>
				<ul className={styles.factList}>
					<li>Endereço do local</li>
					<li>Data e horário da largada</li>
					<li>Percurso de cada distância</li>
					<li>Retirada do kit e da camisa</li>
					<li>Valor da inscrição</li>
				</ul>

				<p className={styles.note}>
					Quando essas informações existirem, elas passam a ser editadas pela
					organização direto no app — sem precisar de um novo deploy.
				</p>
			</SectionCard>
		</main>
	);
};
