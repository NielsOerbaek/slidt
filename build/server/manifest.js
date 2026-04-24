const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["assets/logo/ood-logo-full-colors.svg","assets/logo/ood-logo-full-stem.svg","assets/logo/ood-logo-full.svg","assets/logo/ood-mark-green.svg","assets/logo/ood-mark-violet.svg","assets/logo/ood-mark.svg","assets/logo/ood-type-horizontal.svg","assets/logo/ood-type-vertical.svg","favicon.svg","fonts/Neureal-Regular.woff2","fonts/NeurealMono-Regular.woff2","fonts/inter/inter-latin-300-normal.woff2","fonts/inter/inter-latin-400-normal.woff2","fonts/inter/inter-latin-500-normal.woff2","fonts/inter/inter-latin-600-normal.woff2","fonts/jetbrains-mono/jetbrains-mono-latin-400-normal.woff2","fonts/jetbrains-mono/jetbrains-mono-latin-500-normal.woff2"]),
	mimeTypes: {".svg":"image/svg+xml",".woff2":"font/woff2"},
	_: {
		client: {start:"_app/immutable/entry/start.CEGmHIO7.js",app:"_app/immutable/entry/app.BMLyd8i9.js",imports:["_app/immutable/entry/start.CEGmHIO7.js","_app/immutable/chunks/u-nYIF9U.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/entry/app.BMLyd8i9.js","_app/immutable/chunks/CWOWk0v5.js","_app/immutable/chunks/CA356dsv.js","_app/immutable/chunks/AZeLEXKw.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CCUpw2uT.js')),
			__memo(() => import('./chunks/1-HoT3Vmvb.js')),
			__memo(() => import('./chunks/2-yVGogJNx.js')),
			__memo(() => import('./chunks/3-h139xwit.js')),
			__memo(() => import('./chunks/4-CNq0PUrF.js')),
			__memo(() => import('./chunks/5-UD9b-Cu8.js')),
			__memo(() => import('./chunks/6-EkbiSxHH.js')),
			__memo(() => import('./chunks/7-9ZE4lP7R.js')),
			__memo(() => import('./chunks/8-DX2hxqdR.js')),
			__memo(() => import('./chunks/9-Cwd866_2.js')),
			__memo(() => import('./chunks/10-DxftwXeg.js')),
			__memo(() => import('./chunks/11-CJ-8sc6E.js')),
			__memo(() => import('./chunks/12-DAisnrxe.js')),
			__memo(() => import('./chunks/13-Cbu0UUJN.js')),
			__memo(() => import('./chunks/14-iX2idPOM.js')),
			__memo(() => import('./chunks/15-DRgg2STH.js')),
			__memo(() => import('./chunks/16-BG-sTidw.js')),
			__memo(() => import('./chunks/17-DHHG7a-O.js')),
			__memo(() => import('./chunks/18-BSHmQlTW.js')),
			__memo(() => import('./chunks/19-BSesI9kB.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/api/assets",
				pattern: /^\/api\/assets\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-LwUd5oIE.js'))
			},
			{
				id: "/api/assets/[id]",
				pattern: /^\/api\/assets\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CSXCwA8j.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CSTjKQ8E.js'))
			},
			{
				id: "/api/auth/logout",
				pattern: /^\/api\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-5bxBKH7a.js'))
			},
			{
				id: "/api/decks",
				pattern: /^\/api\/decks\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-xw14aK8r.js'))
			},
			{
				id: "/api/decks/[id]",
				pattern: /^\/api\/decks\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-C3ay_i5L.js'))
			},
			{
				id: "/api/decks/[id]/agent",
				pattern: /^\/api\/decks\/([^/]+?)\/agent\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DMjIOXoh.js'))
			},
			{
				id: "/api/decks/[id]/collaborators",
				pattern: /^\/api\/decks\/([^/]+?)\/collaborators\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CrnyjSd6.js'))
			},
			{
				id: "/api/decks/[id]/duplicate",
				pattern: /^\/api\/decks\/([^/]+?)\/duplicate\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BSvwM4xw.js'))
			},
			{
				id: "/api/decks/[id]/export",
				pattern: /^\/api\/decks\/([^/]+?)\/export\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CNMB6D-y.js'))
			},
			{
				id: "/api/decks/[id]/present",
				pattern: /^\/api\/decks\/([^/]+?)\/present\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-yd_yDaSj.js'))
			},
			{
				id: "/api/decks/[id]/share",
				pattern: /^\/api\/decks\/([^/]+?)\/share\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Bh94s6Ag.js'))
			},
			{
				id: "/api/decks/[id]/slides",
				pattern: /^\/api\/decks\/([^/]+?)\/slides\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-D7NksoWn.js'))
			},
			{
				id: "/api/decks/[id]/slides/[slideId]",
				pattern: /^\/api\/decks\/([^/]+?)\/slides\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"slideId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BYffkjGZ.js'))
			},
			{
				id: "/api/keys",
				pattern: /^\/api\/keys\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-C7c_JBiy.js'))
			},
			{
				id: "/api/templates",
				pattern: /^\/api\/templates\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BmoKT_Zd.js'))
			},
			{
				id: "/api/templates/[id]",
				pattern: /^\/api\/templates\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BoKVymgk.js'))
			},
			{
				id: "/api/themes",
				pattern: /^\/api\/themes\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DC_3RHe1.js'))
			},
			{
				id: "/api/themes/[id]",
				pattern: /^\/api\/themes\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CsiJPl_d.js'))
			},
			{
				id: "/decks",
				pattern: /^\/decks\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/decks/[id]",
				pattern: /^\/decks\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/docs",
				pattern: /^\/docs\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/docs/agent",
				pattern: /^\/docs\/agent\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/docs/api",
				pattern: /^\/docs\/api\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/docs/cli",
				pattern: /^\/docs\/cli\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/docs/templates",
				pattern: /^\/docs\/templates\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/docs/themes",
				pattern: /^\/docs\/themes\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/healthz",
				pattern: /^\/healthz\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-YEaEckIv.js'))
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/logout",
				pattern: /^\/logout\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/share/[token]",
				pattern: /^\/share\/([^/]+?)\/?$/,
				params: [{"name":"token","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/templates",
				pattern: /^\/templates\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/templates/[id]",
				pattern: /^\/templates\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/themes",
				pattern: /^\/themes\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/themes/[id]",
				pattern: /^\/themes\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
