//#region src/lib/utils/field-defaults.ts
/**
* Returns realistic-looking placeholder values for use in live preview.
* Unlike buildDefaultData, text fields get sample copy instead of empty strings.
*/
function buildDummyData(fields) {
	const result = {};
	for (const field of fields) if (field.default !== void 0) result[field.name] = field.default;
	else if (field.type === "bool") result[field.name] = true;
	else if (field.type === "select") result[field.name] = field.options?.[0] ?? "";
	else if (field.type === "list") {
		const itemField = field.items;
		if (itemField?.type === "group") result[field.name] = [buildDummyData(itemField.fields ?? []), buildDummyData(itemField.fields ?? [])];
		else result[field.name] = [`${field.label ?? field.name} one`, `${field.label ?? field.name} two`];
	} else if (field.type === "group") result[field.name] = buildDummyData(field.fields ?? []);
	else if (field.type === "image") result[field.name] = "";
	else if (field.type === "markdown") result[field.name] = `**${field.label ?? field.name}** with _emphasis_ and a [link](#)`;
	else result[field.name] = field.label ?? field.name;
	return result;
}

export { buildDummyData as b };
//# sourceMappingURL=field-defaults-DwF33Zkm.js.map
