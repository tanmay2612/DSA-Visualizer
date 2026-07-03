export interface CustomArrayParseResult {
  values: number[] | null;
  error: string | null;
}

const MIN_LENGTH = 2;
const MAX_LENGTH = 30;
const MIN_VALUE = -999;
const MAX_VALUE = 999;

/**
 * Parses a comma-separated string like "5, 2, 8, 1, 9, 4" into a
 * validated number[]. Returns either a populated `values` array
 * with `error: null`, or `values: null` with a specific, actionable
 * `error` message — the caller (the custom input UI) should never
 * need to re-derive what went wrong, just display `error` directly.
 *
 * Validation rules, in order: non-empty, every token must parse as
 * a whole number (rejects "abc", "5,,8", a trailing comma left as
 * an empty token, "5.5"), length must fall within a sane range for
 * a visualization (too few elements isn't a meaningful sort/search
 * demo; too many makes the canvas unreadable and produces an
 * unreasonably long step sequence), and each value must fall within
 * a range the canvas can render sensibly.
 */
export function parseCustomArrayInput(raw: string): CustomArrayParseResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { values: null, error: 'Enter at least two comma-separated numbers.' };
  }

  const tokens = trimmed.split(',').map((token) => token.trim());
  if (tokens.some((token) => token.length === 0)) {
    return {
      values: null,
      error: 'Remove empty values (check for double commas or a trailing comma).',
    };
  }

  const values: number[] = [];
  for (const token of tokens) {
    const parsed = Number(token);
    if (!Number.isFinite(parsed) || !/^-?\d+$/.test(token)) {
      return { values: null, error: `"${token}" isn't a whole number.` };
    }
    values.push(parsed);
  }

  if (values.length < MIN_LENGTH) {
    return { values: null, error: `Enter at least ${MIN_LENGTH} numbers.` };
  }
  if (values.length > MAX_LENGTH) {
    return { values: null, error: `Enter at most ${MAX_LENGTH} numbers (got ${values.length}).` };
  }

  const outOfRange = values.find((v) => v < MIN_VALUE || v > MAX_VALUE);
  if (outOfRange !== undefined) {
    return {
      values: null,
      error: `${outOfRange} is outside the supported range (${MIN_VALUE} to ${MAX_VALUE}).`,
    };
  }

  return { values, error: null };
}
