import { a6 as attr_style, a5 as escape_html, X as derived, a4 as stringify } from './dev-DoNs_J55.js';

//#region src/lib/components/st/STFace.svelte
function STFace($$renderer, $$props) {
	let { size = 18, mood = "idle", color } = $$props;
	const eye = {
		idle: "-",
		thinking: "-",
		happy: "^",
		sleep: "z",
		alert: "o"
	};
	const mouth = {
		idle: "_",
		thinking: ".",
		happy: "_",
		sleep: "_",
		alert: "_"
	};
	const text = derived(() => `${eye[mood]}${mouth[mood]}${eye[mood]}`);
	$$renderer.push(`<span class="st-face svelte-15orpci"${attr_style("", {
		"font-size": `${stringify(size)}px`,
		color: color ?? "currentColor"
	})}>${escape_html(text())}</span>`);
}

export { STFace as S };
//# sourceMappingURL=STFace-Ds-aLye0.js.map
