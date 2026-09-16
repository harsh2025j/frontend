/**
 * Capitalizes the first letter of a plain text string.
 * Handles strings starting with quotes, brackets, or symbols,
 * while leaving numbers and non-cased scripts (like Hindi/Devanagari) safely intact.
 */
export function capitalizeFirstChar(str?: string | null): string {
  if (!str) return "";
  const trimmed = str.trim();
  if (!trimmed) return "";
  // Safely capitalize first letter even if preceded by quotes, brackets, or symbols, leaving numbers and Hindi intact
  return trimmed.replace(/^([\s\p{P}\p{S}]*)(\p{L})/u, (_, prefix, char) => prefix + char.toUpperCase());
}

/**
 * Capitalizes the first visible text character inside an HTML string without corrupting HTML tags or entities.
 */
export function capitalizeFirstCharInHtml(html?: string | null): string {
  if (!html) return "";
  let inTag = false;
  let inEntity = false;

  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    if (char === "<") {
      inTag = true;
    } else if (char === ">") {
      inTag = false;
    } else if (char === "&" && !inTag) {
      inEntity = true;
    } else if (char === ";" && inEntity) {
      inEntity = false;
    } else if (!inTag && !inEntity) {
      // Skip whitespace, quotes, punctuation, or symbols to find the first letter
      if (/[\s\p{P}\p{S}]/u.test(char)) {
        continue;
      }
      if (/\p{L}/u.test(char)) {
        const upper = char.toUpperCase();
        return html.slice(0, i) + upper + html.slice(i + 1);
      }
      // If the first visible character is a number or anything without a letter, return as is
      return html;
    }
  }
  return html;
}
