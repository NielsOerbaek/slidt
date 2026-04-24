import { v as validate } from './validate-CiBKPHUw.js';
import Handlebars from 'handlebars';
import postcss from 'postcss';

//#region src/renderer/fmt.ts
var BOLD_RE = /\*\*([\s\S]+?)\*\*/g;
var EM_RE = /(?<!\*)\*([^*\n]+?)\*(?!\*)/g;
function escapeHtml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
/**
* HTML-escape text, then convert `**bold**`, `*em*`, and `\n` to inline HTML.
* Output is raw HTML. Callers that pass output into Handlebars should use a
* SafeString wrapper (see handlebars.ts).
*/
function fmt(text) {
	if (!text) return "";
	let out = escapeHtml(text);
	out = out.replace(BOLD_RE, (_m, inner) => `<strong>${inner}</strong>`);
	out = out.replace(EM_RE, (_m, inner) => `<em>${inner}</em>`);
	return out.replace(/\n/g, "<br/>");
}
//#endregion
//#region src/renderer/assets/ood-type-vertical.svg?raw
var ood_type_vertical_default = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"TEXT\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 690.82 503.07\">\n  <path d=\"M75.5,222.41h17.69c21.62,0,62.61-61.77,62.61-92.37v-16.85c0-31.16-38.75-92.93-62.61-92.93h-17.69c-21.62,0-62.61,61.77-62.61,92.93v16.85c0,30.6,40.99,92.37,62.61,92.37ZM39.57,109.82c0-16,20.21-53.06,35.38-53.06h18.25c15.16,0,35.94,37.06,35.94,53.06v23.87c0,14.88-20.78,52.22-35.94,52.22h-18.25c-15.16,0-35.38-36.78-35.38-52.22v-23.87Z\"/>\n  <path d=\"M266.14,185.91h-26.11c-8.42,0-25.83-4.77-29.48-19.65h-28.64c4.21,29.48,43.8,56.15,62.33,56.15h22.46c17.13,0,57-31.16,57-50.82v-12.63c0-13.48-19.09-39.03-35.09-42.68l-56.43-13.2c-4.77-1.12-15.16-15.16-15.16-17.97v-8.42c0-9.55,19.09-19.93,26.67-19.93h17.13c9.26,0,23.58,7.58,27.8,19.65h27.79c-3.65-25.55-36.22-56.15-57.84-56.15h-16c-16.85,0-55.87,33.69-55.87,53.91v12.63c0,12.35,17.13,37.9,33.69,41.83l55.03,12.63c5.33,1.12,17.41,12.07,17.41,17.69v8.42c0,9.55-19.09,18.53-26.67,18.53Z\"/>\n  <path d=\"M84.63,286.28H28.76v196.53h55.87c36.78,0,77.77-63.17,77.77-88.16v-19.65c0-25.55-40.99-88.72-77.77-88.72ZM134.32,394.09c0,14.88-24.99,53.62-55.59,53.62h-23.87v-126.34h23.87c30.6,0,55.59,38.46,55.59,54.47v18.25Z\"/>\n  <path d=\"M242.29,286.28l-54.19,196.53h26.67l14.88-54.47h63.45l14.88,54.47h26.67l-54.19-196.53h-38.18ZM238.64,394.65l16.29-59.52h12.91l16.29,59.52h-45.48Z\"/>\n  <polygon points=\"360.04 321.37 416.2 321.37 416.2 482.81 441.47 482.81 441.47 321.37 497.62 321.37 497.62 286.28 360.04 286.28 360.04 321.37\"/>\n  <path d=\"M578.19,286.28l-54.19,196.53h26.67l14.88-54.47h63.45l14.88,54.47h26.67l-54.19-196.53h-38.18ZM574.54,394.65l16.29-59.52h12.91l16.29,59.52h-45.48Z\"/>\n  <path d=\"M673.67,166.8c1.79-1.63,1.92-4.4.3-6.2l-11.54-12.87c-1.62-1.81-4.4-1.97-6.21-.36l-15.28,12.34c-1.73,1.53-4.36,1.47-6.01-.15l-35.36-34.52c-1.83-1.78-1.77-4.74.13-6.44l26.79-24.1c1.92-1.73,3.02-4.19,3.04-6.77l.02-36.25c0-1.89-.77-3.69-2.14-4.99-5.54-5.28-17.63-18.56-22.8-23.03-3.84-3.32-3.95-3.18-9.03-3.18h-29.13c-.34,0-.68.03-1.01.11-3.47.85-4.84,2.57-7.45,5.28-8.46,8.79-9.88,9.9-20.58,20.83-.82.82-1.89,1.96-2.8,2.94-1.2,1.29-1.86,2.99-1.86,4.75v28.93c0,4.11,1.41,7.5,4.08,10.63,4.86,5.7,15.99,16.7,23.12,23.92,1.77,1.8,1.68,4.71-.21,6.39-6.73,5.99-21.65,19.33-27.91,25.34-3.48,3.35-5.78,7.74-5.78,12.59,0,14.21,0,10.68,0,25.93,0,.21.01.43.04.64.51,3.93,1.5,7.45,4.3,10.31q8.66,8.84,18.83,18.8c.28.27.76.7,1.07.94,3.58,2.65,7.56,3.57,12.05,3.57,12.66,0,27.92-.01,41.29-.01.21,0,.54-.01.75-.03,3.84-.33,7.61-1.02,10.9-3.11.17-.11.33-.22.48-.35l18.59-15.22c1.75-1.44,4.31-1.31,5.92.29l14.75,14.71c.12.11.23.22.36.32,1.56,1.25,4.38,2.87,6.37,3.31.27.06.55.08.83.08h7.32c2.44,0,4.42-1.98,4.42-4.42v-18.75s-9.09-9.4-16.98-17.51c-.02-.5,8.67-7.66,16.34-14.68ZM559.39,77.22v-9.96c0-2.48.97-4.86,2.72-6.62,3.27-3.3,8.66-8.7,12.02-11.76,1.15-1.05,1.8-1.32,3.41-1.32h11.33c1.68,0,2.53.89,3.71,1.95,1.99,1.78,5.63,5.48,7.31,7.52.11.13.23.28.36.44.62.78.97,1.75.97,2.74l.1,17.79c.01,2.39-.92,4.69-2.62,6.38-4.53,4.53-10.79,12.69-15.64,16.94-1.76,1.54-4.4,1.44-6.04-.22l-15.62-18.82c-1.29-1.37-2.01-3.18-2.01-5.06ZM617.12,182.11c-4.14,3.94-8.6,7.54-12.86,11.35-.26.23-.55.44-.86.6-.6.32-1.25.49-1.93.52-13.54.49-21.23.43-34.76.07-1.02-.03-2.01-.39-2.78-1.07,0,0-.01-.01-.02-.02-4.16-3.72-8.87-8.09-8.87-9.65,0-2.44-.58-11.12-.48-16.35.02-1.2.54-2.33,1.43-3.14,4.22-3.86,14.28-15.74,20.31-21.21,1.74-1.58,4.42-1.52,6.09.14l35.51,38.39c-.31.02-.57.17-.79.38Z\"/>\n</svg>";
//#endregion
//#region src/renderer/assets/ood-mark-violet.svg?raw
var ood_mark_violet_default = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"CROSSES\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1080 1080\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: none;\n        stroke: #6E31FF;\n        stroke-miterlimit: 10;\n        stroke-width: 2.83px;\n      }\n    </style>\n  </defs>\n  <g>\n    <line class=\"cls-1\" x1=\"171.61\" y1=\"652.39\" x2=\"149.69\" y2=\"713.33\"/>\n    <line class=\"cls-1\" x1=\"191.12\" y1=\"693.82\" x2=\"130.18\" y2=\"671.9\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"698.57\" y1=\"832.88\" x2=\"743.09\" y2=\"879.9\"/>\n    <line class=\"cls-1\" x1=\"744.34\" y1=\"834.13\" x2=\"697.32\" y2=\"878.65\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"183.69\" y1=\"600.06\" x2=\"157.14\" y2=\"659.12\"/>\n    <line class=\"cls-1\" x1=\"199.95\" y1=\"642.86\" x2=\"140.88\" y2=\"616.32\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"665.6\" y1=\"826.24\" x2=\"707.58\" y2=\"875.54\"/>\n    <line class=\"cls-1\" x1=\"711.24\" y1=\"829.9\" x2=\"661.94\" y2=\"871.88\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"216.26\" y1=\"334.12\" x2=\"166.32\" y2=\"375.34\"/>\n    <line class=\"cls-1\" x1=\"211.9\" y1=\"379.7\" x2=\"170.68\" y2=\"329.76\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"773.87\" y1=\"807.81\" x2=\"824.6\" y2=\"848.07\"/>\n    <line class=\"cls-1\" x1=\"819.37\" y1=\"802.58\" x2=\"779.1\" y2=\"853.3\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"199.39\" y1=\"734.91\" x2=\"186.02\" y2=\"798.27\"/>\n    <line class=\"cls-1\" x1=\"224.39\" y1=\"773.27\" x2=\"161.02\" y2=\"759.91\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"232.03\" y1=\"376.6\" x2=\"184.44\" y2=\"420.52\"/>\n    <line class=\"cls-1\" x1=\"230.2\" y1=\"422.36\" x2=\"186.28\" y2=\"374.77\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"245.68\" y1=\"757.34\" x2=\"237.02\" y2=\"821.51\"/>\n    <line class=\"cls-1\" x1=\"273.44\" y1=\"793.75\" x2=\"209.26\" y2=\"785.1\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"700.32\" y1=\"171.08\" x2=\"752.33\" y2=\"132.49\"/>\n    <line class=\"cls-1\" x1=\"707.03\" y1=\"125.79\" x2=\"745.62\" y2=\"177.79\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"740.98\" y1=\"241.21\" x2=\"797.21\" y2=\"209.07\"/>\n    <line class=\"cls-1\" x1=\"753.03\" y1=\"197.03\" x2=\"785.16\" y2=\"253.25\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"126.57\" y1=\"503.9\" x2=\"90.75\" y2=\"557.85\"/>\n    <line class=\"cls-1\" x1=\"135.64\" y1=\"548.78\" x2=\"81.68\" y2=\"512.97\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"268.22\" y1=\"307.94\" x2=\"215.01\" y2=\"344.86\"/>\n    <line class=\"cls-1\" x1=\"260.07\" y1=\"353\" x2=\"223.15\" y2=\"299.8\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"211.3\" y1=\"537.84\" x2=\"178.87\" y2=\"593.9\"/>\n    <line class=\"cls-1\" x1=\"223.11\" y1=\"582.08\" x2=\"167.06\" y2=\"549.66\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"603.77\" y1=\"898.32\" x2=\"637.96\" y2=\"953.31\"/>\n    <line class=\"cls-1\" x1=\"648.37\" y1=\"908.72\" x2=\"593.37\" y2=\"942.91\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"357.12\" y1=\"295.39\" x2=\"374.12\" y2=\"232.9\"/>\n    <line class=\"cls-1\" x1=\"334.38\" y1=\"255.64\" x2=\"396.87\" y2=\"272.64\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"297.62\" y1=\"340.56\" x2=\"305.03\" y2=\"276.23\"/>\n    <line class=\"cls-1\" x1=\"269.16\" y1=\"304.69\" x2=\"333.49\" y2=\"312.1\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"202.82\" y1=\"393.18\" x2=\"157.24\" y2=\"439.18\"/>\n    <line class=\"cls-1\" x1=\"203.03\" y1=\"438.97\" x2=\"157.03\" y2=\"393.39\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"460.84\" y1=\"777.61\" x2=\"476.85\" y2=\"840.36\"/>\n    <line class=\"cls-1\" x1=\"500.22\" y1=\"800.98\" x2=\"437.47\" y2=\"816.99\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"298.24\" y1=\"649.65\" x2=\"282.2\" y2=\"712.4\"/>\n    <line class=\"cls-1\" x1=\"321.59\" y1=\"689.05\" x2=\"258.85\" y2=\"673.01\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"578.83\" y1=\"182.16\" x2=\"622.44\" y2=\"134.28\"/>\n    <line class=\"cls-1\" x1=\"576.7\" y1=\"136.42\" x2=\"624.57\" y2=\"180.03\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"817.65\" y1=\"245.06\" x2=\"876.93\" y2=\"218.99\"/>\n    <line class=\"cls-1\" x1=\"834.25\" y1=\"202.39\" x2=\"860.32\" y2=\"261.67\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"471.04\" y1=\"855.84\" x2=\"490.94\" y2=\"917.47\"/>\n    <line class=\"cls-1\" x1=\"511.8\" y1=\"876.71\" x2=\"450.18\" y2=\"896.61\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"363.59\" y1=\"166.5\" x2=\"387.97\" y2=\"106.51\"/>\n    <line class=\"cls-1\" x1=\"345.79\" y1=\"124.31\" x2=\"405.78\" y2=\"148.69\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"513.42\" y1=\"189.25\" x2=\"551.12\" y2=\"136.59\"/>\n    <line class=\"cls-1\" x1=\"505.94\" y1=\"144.07\" x2=\"558.6\" y2=\"181.77\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"461.98\" y1=\"911.95\" x2=\"482.11\" y2=\"973.49\"/>\n    <line class=\"cls-1\" x1=\"502.82\" y1=\"932.65\" x2=\"441.27\" y2=\"952.79\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"697.5\" y1=\"767.69\" x2=\"745.09\" y2=\"811.61\"/>\n    <line class=\"cls-1\" x1=\"743.26\" y1=\"765.85\" x2=\"699.34\" y2=\"813.44\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"793.98\" y1=\"375.48\" x2=\"852.96\" y2=\"348.74\"/>\n    <line class=\"cls-1\" x1=\"810.1\" y1=\"332.62\" x2=\"836.84\" y2=\"391.6\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"436.13\" y1=\"181.06\" x2=\"466.55\" y2=\"123.89\"/>\n    <line class=\"cls-1\" x1=\"422.75\" y1=\"137.27\" x2=\"479.92\" y2=\"167.69\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"241.81\" y1=\"505.52\" x2=\"206.02\" y2=\"559.49\"/>\n    <line class=\"cls-1\" x1=\"250.9\" y1=\"550.4\" x2=\"196.93\" y2=\"514.61\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"549.46\" y1=\"156.87\" x2=\"590.4\" y2=\"106.69\"/>\n    <line class=\"cls-1\" x1=\"544.84\" y1=\"111.31\" x2=\"595.01\" y2=\"152.25\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"927.59\" y1=\"488.04\" x2=\"992.32\" y2=\"490.07\"/>\n    <line class=\"cls-1\" x1=\"960.97\" y1=\"456.69\" x2=\"958.94\" y2=\"521.42\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"390.51\" y1=\"831.71\" x2=\"400.34\" y2=\"895.72\"/>\n    <line class=\"cls-1\" x1=\"427.43\" y1=\"858.8\" x2=\"363.42\" y2=\"868.63\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"173.91\" y1=\"587.01\" x2=\"145.88\" y2=\"645.39\"/>\n    <line class=\"cls-1\" x1=\"189.09\" y1=\"630.22\" x2=\"130.7\" y2=\"602.19\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"775.43\" y1=\"674.08\" x2=\"833.47\" y2=\"702.79\"/>\n    <line class=\"cls-1\" x1=\"818.81\" y1=\"659.41\" x2=\"790.1\" y2=\"717.46\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"898.91\" y1=\"465.99\" x2=\"963.66\" y2=\"465.1\"/>\n    <line class=\"cls-1\" x1=\"930.85\" y1=\"433.17\" x2=\"931.73\" y2=\"497.92\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"892.15\" y1=\"577.16\" x2=\"955.76\" y2=\"589.26\"/>\n    <line class=\"cls-1\" x1=\"930.01\" y1=\"551.4\" x2=\"917.9\" y2=\"615.02\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"649.04\" y1=\"792.88\" x2=\"690.78\" y2=\"842.4\"/>\n    <line class=\"cls-1\" x1=\"694.67\" y1=\"796.77\" x2=\"645.15\" y2=\"838.51\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"881.03\" y1=\"443.37\" x2=\"945.67\" y2=\"439.44\"/>\n    <line class=\"cls-1\" x1=\"911.39\" y1=\"409.09\" x2=\"915.32\" y2=\"473.73\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"354.31\" y1=\"749.73\" x2=\"354.45\" y2=\"814.49\"/>\n    <line class=\"cls-1\" x1=\"386.76\" y1=\"782.04\" x2=\"322\" y2=\"782.18\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"598.31\" y1=\"191.2\" x2=\"643.67\" y2=\"144.98\"/>\n    <line class=\"cls-1\" x1=\"597.88\" y1=\"145.41\" x2=\"644.1\" y2=\"190.77\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"896.71\" y1=\"398.42\" x2=\"960.94\" y2=\"390.15\"/>\n    <line class=\"cls-1\" x1=\"924.68\" y1=\"362.17\" x2=\"932.96\" y2=\"426.4\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"279.04\" y1=\"675.02\" x2=\"264.69\" y2=\"738.17\"/>\n    <line class=\"cls-1\" x1=\"303.44\" y1=\"713.77\" x2=\"240.29\" y2=\"699.42\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"783.8\" y1=\"238.24\" x2=\"841.74\" y2=\"209.31\"/>\n    <line class=\"cls-1\" x1=\"798.3\" y1=\"194.81\" x2=\"827.23\" y2=\"252.75\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"561.73\" y1=\"162.13\" x2=\"603.73\" y2=\"112.84\"/>\n    <line class=\"cls-1\" x1=\"558.08\" y1=\"116.48\" x2=\"607.37\" y2=\"158.48\"/>\n  </g>\n  <line class=\"cls-1\" x1=\"393.72\" y1=\"888.78\" x2=\"407.46\" y2=\"956.78\"/>\n  <line class=\"cls-1\" x1=\"434.59\" y1=\"915.91\" x2=\"366.59\" y2=\"929.65\"/>\n</svg>";
//#endregion
//#region src/renderer/assets/ood-mark-green.svg?raw
var ood_mark_green_default = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"CROSSES\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1080 1080\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: none;\n        stroke: #9CED7C;\n        stroke-miterlimit: 10;\n        stroke-width: 2.83px;\n      }\n    </style>\n  </defs>\n  <g>\n    <line class=\"cls-1\" x1=\"171.61\" y1=\"652.39\" x2=\"149.69\" y2=\"713.33\"/>\n    <line class=\"cls-1\" x1=\"191.12\" y1=\"693.82\" x2=\"130.18\" y2=\"671.9\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"698.57\" y1=\"832.88\" x2=\"743.09\" y2=\"879.9\"/>\n    <line class=\"cls-1\" x1=\"744.34\" y1=\"834.13\" x2=\"697.32\" y2=\"878.65\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"183.69\" y1=\"600.06\" x2=\"157.14\" y2=\"659.12\"/>\n    <line class=\"cls-1\" x1=\"199.95\" y1=\"642.86\" x2=\"140.88\" y2=\"616.32\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"665.6\" y1=\"826.24\" x2=\"707.58\" y2=\"875.54\"/>\n    <line class=\"cls-1\" x1=\"711.24\" y1=\"829.9\" x2=\"661.94\" y2=\"871.88\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"216.26\" y1=\"334.12\" x2=\"166.32\" y2=\"375.34\"/>\n    <line class=\"cls-1\" x1=\"211.9\" y1=\"379.7\" x2=\"170.68\" y2=\"329.76\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"773.87\" y1=\"807.81\" x2=\"824.6\" y2=\"848.07\"/>\n    <line class=\"cls-1\" x1=\"819.37\" y1=\"802.58\" x2=\"779.1\" y2=\"853.3\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"199.39\" y1=\"734.91\" x2=\"186.02\" y2=\"798.27\"/>\n    <line class=\"cls-1\" x1=\"224.39\" y1=\"773.27\" x2=\"161.02\" y2=\"759.91\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"232.03\" y1=\"376.6\" x2=\"184.44\" y2=\"420.52\"/>\n    <line class=\"cls-1\" x1=\"230.2\" y1=\"422.36\" x2=\"186.28\" y2=\"374.77\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"245.68\" y1=\"757.34\" x2=\"237.02\" y2=\"821.51\"/>\n    <line class=\"cls-1\" x1=\"273.44\" y1=\"793.75\" x2=\"209.26\" y2=\"785.1\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"700.32\" y1=\"171.08\" x2=\"752.33\" y2=\"132.49\"/>\n    <line class=\"cls-1\" x1=\"707.03\" y1=\"125.79\" x2=\"745.62\" y2=\"177.79\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"740.98\" y1=\"241.21\" x2=\"797.21\" y2=\"209.07\"/>\n    <line class=\"cls-1\" x1=\"753.03\" y1=\"197.03\" x2=\"785.16\" y2=\"253.25\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"126.57\" y1=\"503.9\" x2=\"90.75\" y2=\"557.85\"/>\n    <line class=\"cls-1\" x1=\"135.64\" y1=\"548.78\" x2=\"81.68\" y2=\"512.97\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"268.22\" y1=\"307.94\" x2=\"215.01\" y2=\"344.86\"/>\n    <line class=\"cls-1\" x1=\"260.07\" y1=\"353\" x2=\"223.15\" y2=\"299.8\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"211.3\" y1=\"537.84\" x2=\"178.87\" y2=\"593.9\"/>\n    <line class=\"cls-1\" x1=\"223.11\" y1=\"582.08\" x2=\"167.06\" y2=\"549.66\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"603.77\" y1=\"898.32\" x2=\"637.96\" y2=\"953.31\"/>\n    <line class=\"cls-1\" x1=\"648.37\" y1=\"908.72\" x2=\"593.37\" y2=\"942.91\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"357.12\" y1=\"295.39\" x2=\"374.12\" y2=\"232.9\"/>\n    <line class=\"cls-1\" x1=\"334.38\" y1=\"255.64\" x2=\"396.87\" y2=\"272.64\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"297.62\" y1=\"340.56\" x2=\"305.03\" y2=\"276.23\"/>\n    <line class=\"cls-1\" x1=\"269.16\" y1=\"304.69\" x2=\"333.49\" y2=\"312.1\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"202.82\" y1=\"393.18\" x2=\"157.24\" y2=\"439.18\"/>\n    <line class=\"cls-1\" x1=\"203.03\" y1=\"438.97\" x2=\"157.03\" y2=\"393.39\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"460.84\" y1=\"777.61\" x2=\"476.85\" y2=\"840.36\"/>\n    <line class=\"cls-1\" x1=\"500.22\" y1=\"800.98\" x2=\"437.47\" y2=\"816.99\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"298.24\" y1=\"649.65\" x2=\"282.2\" y2=\"712.4\"/>\n    <line class=\"cls-1\" x1=\"321.59\" y1=\"689.05\" x2=\"258.85\" y2=\"673.01\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"578.83\" y1=\"182.16\" x2=\"622.44\" y2=\"134.28\"/>\n    <line class=\"cls-1\" x1=\"576.7\" y1=\"136.42\" x2=\"624.57\" y2=\"180.03\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"817.65\" y1=\"245.06\" x2=\"876.93\" y2=\"218.99\"/>\n    <line class=\"cls-1\" x1=\"834.25\" y1=\"202.39\" x2=\"860.32\" y2=\"261.67\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"471.04\" y1=\"855.84\" x2=\"490.94\" y2=\"917.47\"/>\n    <line class=\"cls-1\" x1=\"511.8\" y1=\"876.71\" x2=\"450.18\" y2=\"896.61\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"363.59\" y1=\"166.5\" x2=\"387.97\" y2=\"106.51\"/>\n    <line class=\"cls-1\" x1=\"345.79\" y1=\"124.31\" x2=\"405.78\" y2=\"148.69\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"513.42\" y1=\"189.25\" x2=\"551.12\" y2=\"136.59\"/>\n    <line class=\"cls-1\" x1=\"505.94\" y1=\"144.07\" x2=\"558.6\" y2=\"181.77\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"461.98\" y1=\"911.95\" x2=\"482.11\" y2=\"973.49\"/>\n    <line class=\"cls-1\" x1=\"502.82\" y1=\"932.65\" x2=\"441.27\" y2=\"952.79\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"697.5\" y1=\"767.69\" x2=\"745.09\" y2=\"811.61\"/>\n    <line class=\"cls-1\" x1=\"743.26\" y1=\"765.85\" x2=\"699.34\" y2=\"813.44\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"793.98\" y1=\"375.48\" x2=\"852.96\" y2=\"348.74\"/>\n    <line class=\"cls-1\" x1=\"810.1\" y1=\"332.62\" x2=\"836.84\" y2=\"391.6\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"436.13\" y1=\"181.06\" x2=\"466.55\" y2=\"123.89\"/>\n    <line class=\"cls-1\" x1=\"422.75\" y1=\"137.27\" x2=\"479.92\" y2=\"167.69\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"241.81\" y1=\"505.52\" x2=\"206.02\" y2=\"559.49\"/>\n    <line class=\"cls-1\" x1=\"250.9\" y1=\"550.4\" x2=\"196.93\" y2=\"514.61\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"549.46\" y1=\"156.87\" x2=\"590.4\" y2=\"106.69\"/>\n    <line class=\"cls-1\" x1=\"544.84\" y1=\"111.31\" x2=\"595.01\" y2=\"152.25\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"927.59\" y1=\"488.04\" x2=\"992.32\" y2=\"490.07\"/>\n    <line class=\"cls-1\" x1=\"960.97\" y1=\"456.69\" x2=\"958.94\" y2=\"521.42\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"390.51\" y1=\"831.71\" x2=\"400.34\" y2=\"895.72\"/>\n    <line class=\"cls-1\" x1=\"427.43\" y1=\"858.8\" x2=\"363.42\" y2=\"868.63\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"173.91\" y1=\"587.01\" x2=\"145.88\" y2=\"645.39\"/>\n    <line class=\"cls-1\" x1=\"189.09\" y1=\"630.22\" x2=\"130.7\" y2=\"602.19\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"775.43\" y1=\"674.08\" x2=\"833.47\" y2=\"702.79\"/>\n    <line class=\"cls-1\" x1=\"818.81\" y1=\"659.41\" x2=\"790.1\" y2=\"717.46\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"898.91\" y1=\"465.99\" x2=\"963.66\" y2=\"465.1\"/>\n    <line class=\"cls-1\" x1=\"930.85\" y1=\"433.17\" x2=\"931.73\" y2=\"497.92\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"892.15\" y1=\"577.16\" x2=\"955.76\" y2=\"589.26\"/>\n    <line class=\"cls-1\" x1=\"930.01\" y1=\"551.4\" x2=\"917.9\" y2=\"615.02\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"649.04\" y1=\"792.88\" x2=\"690.78\" y2=\"842.4\"/>\n    <line class=\"cls-1\" x1=\"694.67\" y1=\"796.77\" x2=\"645.15\" y2=\"838.51\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"881.03\" y1=\"443.37\" x2=\"945.67\" y2=\"439.44\"/>\n    <line class=\"cls-1\" x1=\"911.39\" y1=\"409.09\" x2=\"915.32\" y2=\"473.73\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"354.31\" y1=\"749.73\" x2=\"354.45\" y2=\"814.49\"/>\n    <line class=\"cls-1\" x1=\"386.76\" y1=\"782.04\" x2=\"322\" y2=\"782.18\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"598.31\" y1=\"191.2\" x2=\"643.67\" y2=\"144.98\"/>\n    <line class=\"cls-1\" x1=\"597.88\" y1=\"145.41\" x2=\"644.1\" y2=\"190.77\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"896.71\" y1=\"398.42\" x2=\"960.94\" y2=\"390.15\"/>\n    <line class=\"cls-1\" x1=\"924.68\" y1=\"362.17\" x2=\"932.96\" y2=\"426.4\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"279.04\" y1=\"675.02\" x2=\"264.69\" y2=\"738.17\"/>\n    <line class=\"cls-1\" x1=\"303.44\" y1=\"713.77\" x2=\"240.29\" y2=\"699.42\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"783.8\" y1=\"238.24\" x2=\"841.74\" y2=\"209.31\"/>\n    <line class=\"cls-1\" x1=\"798.3\" y1=\"194.81\" x2=\"827.23\" y2=\"252.75\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"561.73\" y1=\"162.13\" x2=\"603.73\" y2=\"112.84\"/>\n    <line class=\"cls-1\" x1=\"558.08\" y1=\"116.48\" x2=\"607.37\" y2=\"158.48\"/>\n  </g>\n  <line class=\"cls-1\" x1=\"393.72\" y1=\"888.78\" x2=\"407.46\" y2=\"956.78\"/>\n  <line class=\"cls-1\" x1=\"434.59\" y1=\"915.91\" x2=\"366.59\" y2=\"929.65\"/>\n</svg>";
//#endregion
//#region src/renderer/assets/ood-mark.svg?raw
var ood_mark_default = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"CROSSES\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1080 1080\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #fff;\n        stroke: #000;\n        stroke-miterlimit: 10;\n        stroke-width: 2.83px;\n      }\n    </style>\n  </defs>\n  <g>\n    <line class=\"cls-1\" x1=\"171.61\" y1=\"652.39\" x2=\"149.69\" y2=\"713.33\"/>\n    <line class=\"cls-1\" x1=\"191.12\" y1=\"693.82\" x2=\"130.18\" y2=\"671.9\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"698.57\" y1=\"832.88\" x2=\"743.09\" y2=\"879.9\"/>\n    <line class=\"cls-1\" x1=\"744.34\" y1=\"834.13\" x2=\"697.32\" y2=\"878.65\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"183.69\" y1=\"600.06\" x2=\"157.14\" y2=\"659.12\"/>\n    <line class=\"cls-1\" x1=\"199.95\" y1=\"642.86\" x2=\"140.88\" y2=\"616.32\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"665.6\" y1=\"826.24\" x2=\"707.58\" y2=\"875.54\"/>\n    <line class=\"cls-1\" x1=\"711.24\" y1=\"829.9\" x2=\"661.94\" y2=\"871.88\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"216.26\" y1=\"334.12\" x2=\"166.32\" y2=\"375.34\"/>\n    <line class=\"cls-1\" x1=\"211.9\" y1=\"379.7\" x2=\"170.68\" y2=\"329.76\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"773.87\" y1=\"807.81\" x2=\"824.6\" y2=\"848.07\"/>\n    <line class=\"cls-1\" x1=\"819.37\" y1=\"802.58\" x2=\"779.1\" y2=\"853.3\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"199.39\" y1=\"734.91\" x2=\"186.02\" y2=\"798.27\"/>\n    <line class=\"cls-1\" x1=\"224.39\" y1=\"773.27\" x2=\"161.02\" y2=\"759.91\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"232.03\" y1=\"376.6\" x2=\"184.44\" y2=\"420.52\"/>\n    <line class=\"cls-1\" x1=\"230.2\" y1=\"422.36\" x2=\"186.28\" y2=\"374.77\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"245.68\" y1=\"757.34\" x2=\"237.02\" y2=\"821.51\"/>\n    <line class=\"cls-1\" x1=\"273.44\" y1=\"793.75\" x2=\"209.26\" y2=\"785.1\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"700.32\" y1=\"171.08\" x2=\"752.33\" y2=\"132.49\"/>\n    <line class=\"cls-1\" x1=\"707.03\" y1=\"125.79\" x2=\"745.62\" y2=\"177.79\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"740.98\" y1=\"241.21\" x2=\"797.21\" y2=\"209.07\"/>\n    <line class=\"cls-1\" x1=\"753.03\" y1=\"197.03\" x2=\"785.16\" y2=\"253.25\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"126.57\" y1=\"503.9\" x2=\"90.75\" y2=\"557.85\"/>\n    <line class=\"cls-1\" x1=\"135.64\" y1=\"548.78\" x2=\"81.68\" y2=\"512.97\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"268.22\" y1=\"307.94\" x2=\"215.01\" y2=\"344.86\"/>\n    <line class=\"cls-1\" x1=\"260.07\" y1=\"353\" x2=\"223.15\" y2=\"299.8\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"211.3\" y1=\"537.84\" x2=\"178.87\" y2=\"593.9\"/>\n    <line class=\"cls-1\" x1=\"223.11\" y1=\"582.08\" x2=\"167.06\" y2=\"549.66\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"603.77\" y1=\"898.32\" x2=\"637.96\" y2=\"953.31\"/>\n    <line class=\"cls-1\" x1=\"648.37\" y1=\"908.72\" x2=\"593.37\" y2=\"942.91\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"357.12\" y1=\"295.39\" x2=\"374.12\" y2=\"232.9\"/>\n    <line class=\"cls-1\" x1=\"334.38\" y1=\"255.64\" x2=\"396.87\" y2=\"272.64\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"297.62\" y1=\"340.56\" x2=\"305.03\" y2=\"276.23\"/>\n    <line class=\"cls-1\" x1=\"269.16\" y1=\"304.69\" x2=\"333.49\" y2=\"312.1\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"202.82\" y1=\"393.18\" x2=\"157.24\" y2=\"439.18\"/>\n    <line class=\"cls-1\" x1=\"203.03\" y1=\"438.97\" x2=\"157.03\" y2=\"393.39\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"460.84\" y1=\"777.61\" x2=\"476.85\" y2=\"840.36\"/>\n    <line class=\"cls-1\" x1=\"500.22\" y1=\"800.98\" x2=\"437.47\" y2=\"816.99\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"298.24\" y1=\"649.65\" x2=\"282.2\" y2=\"712.4\"/>\n    <line class=\"cls-1\" x1=\"321.59\" y1=\"689.05\" x2=\"258.85\" y2=\"673.01\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"578.83\" y1=\"182.16\" x2=\"622.44\" y2=\"134.28\"/>\n    <line class=\"cls-1\" x1=\"576.7\" y1=\"136.42\" x2=\"624.57\" y2=\"180.03\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"817.65\" y1=\"245.06\" x2=\"876.93\" y2=\"218.99\"/>\n    <line class=\"cls-1\" x1=\"834.25\" y1=\"202.39\" x2=\"860.32\" y2=\"261.67\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"471.04\" y1=\"855.84\" x2=\"490.94\" y2=\"917.47\"/>\n    <line class=\"cls-1\" x1=\"511.8\" y1=\"876.71\" x2=\"450.18\" y2=\"896.61\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"363.59\" y1=\"166.5\" x2=\"387.97\" y2=\"106.51\"/>\n    <line class=\"cls-1\" x1=\"345.79\" y1=\"124.31\" x2=\"405.78\" y2=\"148.69\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"513.42\" y1=\"189.25\" x2=\"551.12\" y2=\"136.59\"/>\n    <line class=\"cls-1\" x1=\"505.94\" y1=\"144.07\" x2=\"558.6\" y2=\"181.77\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"461.98\" y1=\"911.95\" x2=\"482.11\" y2=\"973.49\"/>\n    <line class=\"cls-1\" x1=\"502.82\" y1=\"932.65\" x2=\"441.27\" y2=\"952.79\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"697.5\" y1=\"767.69\" x2=\"745.09\" y2=\"811.61\"/>\n    <line class=\"cls-1\" x1=\"743.26\" y1=\"765.85\" x2=\"699.34\" y2=\"813.44\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"793.98\" y1=\"375.48\" x2=\"852.96\" y2=\"348.74\"/>\n    <line class=\"cls-1\" x1=\"810.1\" y1=\"332.62\" x2=\"836.84\" y2=\"391.6\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"436.13\" y1=\"181.06\" x2=\"466.55\" y2=\"123.89\"/>\n    <line class=\"cls-1\" x1=\"422.75\" y1=\"137.27\" x2=\"479.92\" y2=\"167.69\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"241.81\" y1=\"505.52\" x2=\"206.02\" y2=\"559.49\"/>\n    <line class=\"cls-1\" x1=\"250.9\" y1=\"550.4\" x2=\"196.93\" y2=\"514.61\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"549.46\" y1=\"156.87\" x2=\"590.4\" y2=\"106.69\"/>\n    <line class=\"cls-1\" x1=\"544.84\" y1=\"111.31\" x2=\"595.01\" y2=\"152.25\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"927.59\" y1=\"488.04\" x2=\"992.32\" y2=\"490.07\"/>\n    <line class=\"cls-1\" x1=\"960.97\" y1=\"456.69\" x2=\"958.94\" y2=\"521.42\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"390.51\" y1=\"831.71\" x2=\"400.34\" y2=\"895.72\"/>\n    <line class=\"cls-1\" x1=\"427.43\" y1=\"858.8\" x2=\"363.42\" y2=\"868.63\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"173.91\" y1=\"587.01\" x2=\"145.88\" y2=\"645.39\"/>\n    <line class=\"cls-1\" x1=\"189.09\" y1=\"630.22\" x2=\"130.7\" y2=\"602.19\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"775.43\" y1=\"674.08\" x2=\"833.47\" y2=\"702.79\"/>\n    <line class=\"cls-1\" x1=\"818.81\" y1=\"659.41\" x2=\"790.1\" y2=\"717.46\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"898.91\" y1=\"465.99\" x2=\"963.66\" y2=\"465.1\"/>\n    <line class=\"cls-1\" x1=\"930.85\" y1=\"433.17\" x2=\"931.73\" y2=\"497.92\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"892.15\" y1=\"577.16\" x2=\"955.76\" y2=\"589.26\"/>\n    <line class=\"cls-1\" x1=\"930.01\" y1=\"551.4\" x2=\"917.9\" y2=\"615.02\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"649.04\" y1=\"792.88\" x2=\"690.78\" y2=\"842.4\"/>\n    <line class=\"cls-1\" x1=\"694.67\" y1=\"796.77\" x2=\"645.15\" y2=\"838.51\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"881.03\" y1=\"443.37\" x2=\"945.67\" y2=\"439.44\"/>\n    <line class=\"cls-1\" x1=\"911.39\" y1=\"409.09\" x2=\"915.32\" y2=\"473.73\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"354.31\" y1=\"749.73\" x2=\"354.45\" y2=\"814.49\"/>\n    <line class=\"cls-1\" x1=\"386.76\" y1=\"782.04\" x2=\"322\" y2=\"782.18\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"598.31\" y1=\"191.2\" x2=\"643.67\" y2=\"144.98\"/>\n    <line class=\"cls-1\" x1=\"597.88\" y1=\"145.41\" x2=\"644.1\" y2=\"190.77\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"896.71\" y1=\"398.42\" x2=\"960.94\" y2=\"390.15\"/>\n    <line class=\"cls-1\" x1=\"924.68\" y1=\"362.17\" x2=\"932.96\" y2=\"426.4\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"279.04\" y1=\"675.02\" x2=\"264.69\" y2=\"738.17\"/>\n    <line class=\"cls-1\" x1=\"303.44\" y1=\"713.77\" x2=\"240.29\" y2=\"699.42\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"783.8\" y1=\"238.24\" x2=\"841.74\" y2=\"209.31\"/>\n    <line class=\"cls-1\" x1=\"798.3\" y1=\"194.81\" x2=\"827.23\" y2=\"252.75\"/>\n  </g>\n  <g>\n    <line class=\"cls-1\" x1=\"561.73\" y1=\"162.13\" x2=\"603.73\" y2=\"112.84\"/>\n    <line class=\"cls-1\" x1=\"558.08\" y1=\"116.48\" x2=\"607.37\" y2=\"158.48\"/>\n  </g>\n  <line class=\"cls-1\" x1=\"393.72\" y1=\"888.78\" x2=\"407.46\" y2=\"956.78\"/>\n  <line class=\"cls-1\" x1=\"434.59\" y1=\"915.91\" x2=\"366.59\" y2=\"929.65\"/>\n</svg>";
//#endregion
//#region src/renderer/symbols.ts
function svgInnerAndViewBox(svg) {
	return {
		viewBox: svg.match(/<svg[^>]*\sviewBox="([^"]+)"/i)?.[1] ?? "",
		inner: svg.replace(/<\?xml[^?]*\?>\s*/g, "").replace(/<svg\b[^>]*>/i, "").replace(/<\/svg>\s*$/i, "").trim()
	};
}
var { viewBox: CORNER_VIEWBOX, inner: CORNER_INNER } = svgInnerAndViewBox(ood_type_vertical_default);
var CORNER_SYMBOL_ID = "ood-type-vertical";
function cornerMarkup() {
	return `<div class="corner-logo" role="img" aria-label="Os & Data"><svg viewBox="${CORNER_VIEWBOX}" aria-hidden="true"><use href="#${CORNER_SYMBOL_ID}"/></svg></div>`;
}
var DANDELION_SVGS = {
	"dandelion-green": ood_mark_green_default,
	"dandelion-violet": ood_mark_violet_default,
	"dandelion-white": ood_mark_default
};
function stripXmlDecl(svg) {
	return svg.replace(/<\?xml[^?]*\?>\s*/g, "").trim();
}
function dandelionSvg(mark) {
	return stripXmlDecl(DANDELION_SVGS[mark] ?? DANDELION_SVGS["dandelion-violet"]);
}
/**
* Single <svg> island that defines every reusable symbol (currently just the
* corner wordmark). Emitted once per rendered page.
*/
function symbolDefs() {
	return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="${CORNER_SYMBOL_ID}" viewBox="${CORNER_VIEWBOX}">${CORNER_INNER}</symbol></svg>`;
}
//#endregion
//#region src/renderer/handlebars.ts
var env = Handlebars.create();
env.registerHelper("fmt", (value) => {
	const text = typeof value === "string" ? value : value == null ? "" : String(value);
	return new env.SafeString(fmt(text));
});
env.registerHelper("eq", (a, b) => a === b);
env.registerHelper("default", (value, fallback) => {
	if (value === null || value === void 0 || value === "") return fallback;
	return value;
});
env.registerHelper("dandelion", (mark) => {
	const name = typeof mark === "string" && mark ? mark : "dandelion-violet";
	return new env.SafeString(dandelionSvg(name));
});
var cache = /* @__PURE__ */ new Map();
function compile(source) {
	const cached = cache.get(source);
	if (cached) return cached;
	const fn = env.compile(source, {
		noEscape: false,
		strict: false
	});
	cache.set(source, fn);
	return fn;
}
//#endregion
//#region src/renderer/theme-css.ts
function themeCss(theme) {
	const lines = [":root {"];
	for (const [key, value] of Object.entries(theme.tokens)) {
		if (!key.startsWith("--")) throw new Error(`Theme token name must be a CSS custom property (start with "--"): ${key}`);
		if (value.includes(";")) throw new Error(`Theme token value must not contain semicolon: ${key} = ${value}`);
		lines.push(`  ${key}: ${value};`);
	}
	lines.push("}", "");
	return lines.join("\n");
}
//#endregion
//#region src/renderer/scope-css.ts
var LEAVE_ALONE_AT = new Set([
	"font-face",
	"keyframes",
	"page",
	"counter-style"
]);
function scopePlugin(scope) {
	const prefix = `.st-${scope}`;
	return {
		postcssPlugin: "scope-css",
		Once(root) {
			root.walkAtRules((rule) => {
				if (rule.name === "import") throw new Error("CSS @import is not allowed");
			});
			root.walkRules((rule) => {
				rule.selectors = rule.selectors.map((s) => s.trim() === "&" ? "__SCOPE_ROOT__" : s);
			});
			root.walkRules((rule) => {
				let parent = rule.parent;
				while (parent && parent.type !== "root") {
					if (parent.type === "atrule" && LEAVE_ALONE_AT.has(parent.name)) return;
					parent = parent.parent;
				}
				rule.selectors = rule.selectors.map((sel) => {
					const s = sel.trim();
					if (s === ":root" || s === "html" || s === "body") return s;
					if (s === "__SCOPE_ROOT__") return prefix;
					return `${prefix} ${s}`;
				});
			});
		}
	};
}
scopePlugin.postcss = true;
async function scopeCss(css, scope) {
	return (await postcss([scopePlugin(scope)]).process(css, { from: void 0 })).css;
}
//#endregion
//#region src/renderer/slide-wrap.ts
function pad2(n) {
	return n < 10 ? `0${n}` : String(n);
}
function wrapSlide(content, opts) {
	const showCorner = opts.showCorner !== false;
	const counter = `<div class="page-num">${pad2(opts.pageNum)} / ${pad2(opts.total)}</div>`;
	const corner = showCorner ? cornerMarkup() : "";
	return `<section class="slide st-${opts.name}">\n${content}\n${corner}${counter}\n</section>`;
}
//#endregion
//#region src/renderer/page-shell.ts
function escape(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function pageShell(opts) {
	return `<!doctype html>
<html lang="${escape(opts.lang)}">
<head>
<meta charset="utf-8" />
<title>${escape(opts.title)}</title>
<style>${opts.css}</style>
</head>
<body>
${opts.body}
</body>
</html>
`;
}
//#endregion
//#region src/renderer/base-styles.ts
/**
* Global stylesheet included in every rendered deck. Ported from
* reference/slides/styles.css — the source-of-truth visual contract for the
* ANTAL-Theta look. Per-slide-type styles live in each SlideType.css and are
* auto-scoped to `.st-<name>` at render time. Fonts are injected separately
* by src/lib/server/pdf.ts via buildFontCss().
*/
var cornerStyles = `.corner-logo {
  position: absolute;
  right: 60px;
  bottom: 52px;
  width: 60px;
  height: 44px;
  color: var(--ood-deep-violet);
  opacity: 0.85;
}
.corner-logo svg { width: 100%; height: 100%; fill: currentColor; }
.slide.dark .corner-logo { color: var(--ood-wicked-matrix-light); }`;
var baseStyles = `
@page { size: 1920px 1080px; margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 1920px;
  background: var(--ood-big-cloud);
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  color: var(--ood-dark-matter);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.slide {
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
  display: flex;
  padding: 80px 120px;
  background: var(--ood-big-cloud);
  color: var(--ood-dark-matter);
}

.slide:last-child { page-break-after: auto; }

.slide.dark { background: var(--ood-dark-matter); color: var(--ood-white); }
.slide.light { background: var(--ood-big-cloud); color: var(--ood-dark-matter); }
.slide.white { background: var(--ood-white); color: var(--ood-dark-matter); }

h1, h2, h3, h4 {
  font-family: 'Neureal', 'Inter', sans-serif;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.005em;
  color: var(--ood-deep-violet);
}
.slide.dark h1,
.slide.dark h2,
.slide.dark h3,
.slide.dark h4 { color: var(--ood-wicked-matrix-light); }

p, li {
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  line-height: 1.45;
}

strong, .subheading {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

em {
  font-style: normal;
  font-weight: 500;
  color: var(--ood-deep-violet);
}
.slide.dark em { color: var(--ood-wicked-matrix-light); }

.mono, .num {
  font-family: 'Neureal Mono', 'Courier New', monospace;
  font-weight: 400;
}

.page-num {
  position: absolute;
  right: 60px;
  top: 52px;
  font-family: 'Neureal Mono', 'Courier New', monospace;
  font-size: 14px;
  letter-spacing: 0.06em;
  color: var(--ood-deep-violet);
  opacity: 0.7;
  line-height: 1.2;
  z-index: 2;
}
.slide.dark .page-num { color: var(--ood-deep-violet-light); opacity: 0.85; }
`;
//#endregion
//#region src/renderer/index.ts
async function render(deck, theme, templates, options = {}) {
	const byName = new Map(templates.map((t) => [t.name, t]));
	const slides = buildSlideList(deck, options);
	const usedTypeNames = /* @__PURE__ */ new Set();
	const slideHtml = [];
	const total = slides.length;
	for (let i = 0; i < slides.length; i++) {
		const slide = slides[i];
		const type = byName.get(slide.typeName);
		if (!type) throw new Error(`Unknown slide type: ${slide.typeName}`);
		usedTypeNames.add(type.name);
		if (!options.skipValidation) validate(slide.data, type.fields);
		const inner = compile(type.htmlTemplate)(slide.data);
		slideHtml.push(wrapSlide(inner, {
			name: type.name,
			pageNum: i + 1,
			total,
			showCorner: !type.hideCorner
		}));
	}
	const perTypeCss = [];
	for (const name of usedTypeNames) {
		const type = byName.get(name);
		if (type.css.trim()) perTypeCss.push(await scopeCss(type.css, name));
	}
	const hasCorner = slides.some((s) => {
		const t = byName.get(s.typeName);
		return t && !t.hideCorner;
	});
	const css = [
		themeCss(theme),
		baseStyles,
		...hasCorner ? [cornerStyles] : [],
		...perTypeCss
	].join("\n");
	const bodyParts = [];
	if (hasCorner) bodyParts.push(symbolDefs());
	bodyParts.push(slideHtml.join("\n\n"));
	return pageShell({
		lang: deck.lang,
		title: deck.title,
		css,
		body: bodyParts.join("\n\n")
	});
}
function buildSlideList(deck, options) {
	const slides = [...deck.slides];
	if (!options.skipAppendixList && deck.appendix && deck.appendix.length > 0) slides.push({
		typeName: "appendix-list",
		data: {
			eyebrow: deck.appendixEyebrow ?? "Bilag",
			title: deck.appendixTitle ?? "Tilhørende materiale",
			items: deck.appendix
		}
	});
	return slides;
}

export { render as r };
//# sourceMappingURL=renderer-AiFTzwmy.js.map
