/**
 * Setup do SDK do Firebase. SÓ configuração e instâncias — nenhuma regra de negócio aqui.
 *
 * Quem *usa* essas instâncias mora em `src/services/`. Isso mantém o Firebase
 * isolado numa camada só: se um dia trocarmos de backend, mexemos em uma pasta.
 * Ver `specs/BACKEND.md` e `specs/STRUCTURE.md`.
 */
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

/**
 * Os valores vêm do arquivo `.env` (copiado de `.env.example`).
 * `import.meta.env` é como o Vite expõe variáveis de ambiente no navegador —
 * só as que começam com `VITE_` são incluídas no bundle.
 */
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);

/** Instância de autenticação. Usada pelo login com Google. */
export const firebaseAuth = getAuth(firebaseApp);

/** Instância do Realtime Database — onde todos os dados do app são gravados. */
export const firebaseDatabase = getDatabase(firebaseApp);

/**
 * Provider do login com Google.
 * `prompt: "select_account"` força a tela de escolha de conta em todo login,
 * em vez de reentrar silenciosamente com a última conta usada.
 */
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: "select_account" });
