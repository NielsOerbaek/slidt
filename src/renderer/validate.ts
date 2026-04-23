import type { Field } from './types.ts';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function checkField(value: unknown, field: Field, path: string): void {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value === '') ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) {
    throw new ValidationError(`Required field missing: ${path}`);
  }
  if (isEmpty) return;

  switch (field.type) {
    case 'text':
    case 'richtext':
    case 'markdown': {
      if (typeof value !== 'string') {
        throw new ValidationError(`Field ${path} must be text, got ${typeof value}`);
      }
      return;
    }
    case 'bool': {
      if (typeof value !== 'boolean') {
        throw new ValidationError(`Field ${path} must be bool, got ${typeof value}`);
      }
      return;
    }
    case 'select': {
      if (typeof value !== 'string' || !field.options?.includes(value)) {
        throw new ValidationError(
          `Field ${path} must be one of ${JSON.stringify(field.options ?? [])}, got ${JSON.stringify(value)}`,
        );
      }
      return;
    }
    case 'image': {
      if (typeof value !== 'string') {
        throw new ValidationError(`Field ${path} must be image (string ref), got ${typeof value}`);
      }
      return;
    }
    case 'list': {
      if (!Array.isArray(value)) {
        throw new ValidationError(`Field ${path} must be list, got ${typeof value}`);
      }
      if (!field.items) {
        throw new ValidationError(`List field ${path} missing 'items' schema`);
      }
      value.forEach((el, i) => {
        if (field.items!.type === 'group') {
          checkGroup(el, field.items!, `${path}[${i}]`);
        } else {
          checkField(el, field.items!, `${path}[${i}]`);
        }
      });
      return;
    }
    case 'group': {
      checkGroup(value, field, path);
      return;
    }
  }
}

function checkGroup(value: unknown, field: Field, path: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`Field ${path} must be an object, got ${typeof value}`);
  }
  if (!field.fields) {
    throw new ValidationError(`Group field ${path} missing 'fields' schema`);
  }
  const obj = value as Record<string, unknown>;
  for (const sub of field.fields) {
    checkField(obj[sub.name], sub, `${path}.${sub.name}`);
  }
}

export function validate(data: unknown, fields: Field[]): void {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ValidationError('slide data must be an object');
  }
  const obj = data as Record<string, unknown>;
  for (const f of fields) {
    checkField(obj[f.name], f, f.name);
  }
}
