import { withPrefix } from "@/helpers/conversions";
import { atom } from "recoil";

export const themeAtom = atom({
	key: withPrefix("theme"),
	default: "light",
});
