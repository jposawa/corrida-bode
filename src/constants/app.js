/**
 * Identificador do app.
 *
 * Fica em arquivo próprio (e não no `index.js`) porque `constants/database.js`
 * precisa dele. Se ele morasse no barrel, `database.js` importaria de `index.js`,
 * que por sua vez importa `database.js` — import circular.
 */
export const APP_KEY = "corrida-bode";
