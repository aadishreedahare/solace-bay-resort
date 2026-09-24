// Small helpers for reading values out of FormData in server actions.

export function field(form: FormData, key: string) {
  return String(form.get(key) ?? '').trim();
}

export function optionalField(form: FormData, key: string) {
  return field(form, key) || null;
}

export function optionalNumber(form: FormData, key: string) {
  const value = field(form, key);
  return value ? Number(value) : null;
}

export function optionalDate(form: FormData, key: string) {
  const value = field(form, key);
  return value ? new Date(value) : null;
}
