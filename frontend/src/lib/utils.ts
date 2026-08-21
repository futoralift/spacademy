import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSubjectColorStyles(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use a set of distinct hues for better visual separation
  const hues = [
    210, // Blue
    150, // Teal
    280, // Purple
    20,  // Orange
    340, // Pink
    110, // Green
    250, // Indigo
    180, // Cyan
    50,  // Yellow
    310, // Magenta
    130, // Lime
    10,  // Red
  ];

  const hue = hues[Math.abs(hash) % hues.length];
  return {
    backgroundColor: `hsla(${hue}, 85%, 96%, 1)`,
    borderLeftColor: `hsla(${hue}, 80%, 45%, 1)`,
    color: `hsla(${hue}, 80%, 30%, 1)`,
  };
}
export function formatCurrency(amount: number | null, currency: string) {
  if (amount === null || amount === 0) return "Free";
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;
  return `${symbol}${amount.toLocaleString()}`;
}

/**
 * Parses a PostgreSQL array literal string (e.g. '{"item1", "item2"}') or returns the input if it's already an array.
 */
export function parsePostgresList(value: any): string[] {
  if (Array.isArray(value)) {
    if (value.length === 1 && typeof value[0] === "string" && value[0].startsWith("{")) {
      return parsePostgresList(value[0]);
    }
    return value.length ? value : [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const inner = trimmed.slice(1, -1);
      if (!inner.trim()) return [];

      const items: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < inner.length; i++) {
        const char = inner[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          items.push(current.trim().replace(/^"(.*)"$/, "$1"));
          current = "";
        } else {
          current += char;
        }
      }
      items.push(current.trim().replace(/^"(.*)"$/, "$1"));

      return items;
    }
    return trimmed ? [trimmed] : [];
  }
  return [];
}
