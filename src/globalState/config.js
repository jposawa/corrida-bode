import { atom } from "recoil";

import { BASE_CLIENT_CONFIG } from "@/constants";
import { withPrefix } from "@/helpers";

/** Config do app vinda do banco. Escrito pelo useClientConfigSync. */
export const clientConfigAtom = atom({
	key: withPrefix("clientConfig"),
	default: BASE_CLIENT_CONFIG,
});
