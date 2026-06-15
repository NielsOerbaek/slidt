import type { Field } from './types.ts';
import { isFit } from './image-transform.ts';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function checkField(value: unknown, field: Field, path: string, requireRequired: boolean): void {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value === '') ||
    (Array.isArray(value) && value.length === 0);

  if (requireRequired && field.required && isEmpty) {
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
      if (typeof value === 'string') {
        return;
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>;
        if (typeof obj.id === 'string') {
          if ('fit' in obj && !isFit(obj.fit)) {
            throw new ValidationError(
              `Field ${path} has invalid image fit: ${String(obj.fit)}`,
            );
          }
          return;
        }
      }
      throw new ValidationError(
        `Field ${path} must be image (string, fit object, or crop object), got ${typeof value}`,
      );
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
          checkGroup(el, field.items!, `${path}[${i}]`, requireRequired);
        } else {
          checkField(el, field.items!, `${path}[${i}]`, requireRequired);
        }
      });
      return;
    }
    case 'group': {
      checkGroup(value, field, path, requireRequired);
      return;
    }
  }
}

function checkGroup(value: unknown, field: Field, path: string, requireRequired: boolean): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`Field ${path} must be an object, got ${typeof value}`);
  }
  if (!field.fields) {
    throw new ValidationError(`Group field ${path} missing 'fields' schema`);
  }
  const obj = value as Record<string, unknown>;
  for (const sub of field.fields) {
    checkField(obj[sub.name], sub, `${path}.${sub.name}`, requireRequired);
  }
}

export interface ValidateOptions {
  /**
   * Enforce `required` fields (throw when one is empty). Defaults to true.
   * Rendering passes false so a deck with mid-edit / intentionally-empty
   * fields can still preview, present, and export instead of 500-ing.
   */
  requireRequired?: boolean;
}

export function validate(data: unknown, fields: Field[], options: ValidateOptions = {}): void {
  const requireRequired = options.requireRequired ?? true;
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ValidationError('slide data must be an object');
  }
  const obj = data as Record<string, unknown>;
  for (const f of fields) {
    checkField(obj[f.name], f, f.name, requireRequired);
  }
}
