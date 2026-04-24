//#region src/renderer/validate.ts
var ValidationError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "ValidationError";
	}
};
function checkField(value, field, path) {
	const isEmpty = value === void 0 || value === null || typeof value === "string" && value === "" || Array.isArray(value) && value.length === 0;
	if (field.required && isEmpty) throw new ValidationError(`Required field missing: ${path}`);
	if (isEmpty) return;
	switch (field.type) {
		case "text":
		case "richtext":
		case "markdown":
			if (typeof value !== "string") throw new ValidationError(`Field ${path} must be text, got ${typeof value}`);
			return;
		case "bool":
			if (typeof value !== "boolean") throw new ValidationError(`Field ${path} must be bool, got ${typeof value}`);
			return;
		case "select":
			if (typeof value !== "string" || !field.options?.includes(value)) throw new ValidationError(`Field ${path} must be one of ${JSON.stringify(field.options ?? [])}, got ${JSON.stringify(value)}`);
			return;
		case "image":
			if (typeof value !== "string") throw new ValidationError(`Field ${path} must be image (string ref), got ${typeof value}`);
			return;
		case "list":
			if (!Array.isArray(value)) throw new ValidationError(`Field ${path} must be list, got ${typeof value}`);
			if (!field.items) throw new ValidationError(`List field ${path} missing 'items' schema`);
			value.forEach((el, i) => {
				if (field.items.type === "group") checkGroup(el, field.items, `${path}[${i}]`);
				else checkField(el, field.items, `${path}[${i}]`);
			});
			return;
		case "group":
			checkGroup(value, field, path);
			return;
	}
}
function checkGroup(value, field, path) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new ValidationError(`Field ${path} must be an object, got ${typeof value}`);
	if (!field.fields) throw new ValidationError(`Group field ${path} missing 'fields' schema`);
	const obj = value;
	for (const sub of field.fields) checkField(obj[sub.name], sub, `${path}.${sub.name}`);
}
function validate(data, fields) {
	if (typeof data !== "object" || data === null || Array.isArray(data)) throw new ValidationError("slide data must be an object");
	const obj = data;
	for (const f of fields) checkField(obj[f.name], f, f.name);
}

export { ValidationError as V, validate as v };
//# sourceMappingURL=validate-CiBKPHUw.js.map
