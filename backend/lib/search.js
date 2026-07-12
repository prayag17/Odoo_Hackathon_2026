// Builds a Postgres tsquery string that matches each word in the user's
// input as a PREFIX (word:*), so "bol" matches "Bolero" while typing,
// instead of plainto_tsquery's whole-lexeme-only matching. Special tsquery
// operators are stripped out of each word since they're not meant to be
// user-controlled query syntax.
export function toPrefixTsQuery(q) {
  return q
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[&|!():*]/g, ""))
    .filter(Boolean)
    .map((word) => `${word}:*`)
    .join(" & ");
}
