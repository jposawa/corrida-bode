/**
 * Fica em arquivo próprio (e não no `index.js`) porque `constants/database.js`
 * precisa dele — pelo barrel seria import circular.
 */
export const APP_KEY = "corrida-bode";
