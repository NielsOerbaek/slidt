import { redirect } from '@sveltejs/kit';

//#region src/lib/utils/paths.ts
function isPublicPath(pathname) {
	return pathname === "/login" || pathname.startsWith("/share/");
}
//#endregion
//#region src/routes/+layout.server.ts
var load = async ({ locals, url }) => {
	if (!locals.user && !isPublicPath(url.pathname)) throw redirect(302, `/login?next=${encodeURIComponent(url.pathname)}`);
	return {
		user: locals.user,
		locale: locals.user?.preferences?.locale ?? "da"
	};
};

var _layout_server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null,
	load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-53W2MtO4.js')).default;
const server_id = "src/routes/+layout.server.ts";
const imports = ["_app/immutable/nodes/0.B5sVla32.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/CF2GYeVm.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/AZeLEXKw.js","_app/immutable/chunks/BsghtdZd.js","_app/immutable/chunks/g3KcxgbC.js"];
const stylesheets = ["_app/immutable/assets/STFace.Boe-KZeP.css","_app/immutable/assets/0.CU1RBpt1.css"];
const fonts = [];

export { component, fonts, imports, index, _layout_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=0-CCUpw2uT.js.map
