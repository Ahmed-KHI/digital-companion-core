/**
 * Convert a serialized date (ISO string) back to a Date.
 * Also accepts a Date, so the old export shape still works.
 * Throws a clear error for anything else, so invalid snapshots are rejected.
 */
export function parseDate(value: unknown, field: string): Date {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return new Date(value.getTime());
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  throw new Error(`Invalid snapshot: "${field}" is not a valid date`);
}
