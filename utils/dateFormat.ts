/**
 * Format date string to readable format
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "Dec 10, 2024")
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format date to short format
 * @param dateString - ISO date string
 * @returns Short formatted date (e.g., "Dec 10")
 */
export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
}
