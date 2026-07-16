export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  // Ensure the date string uses 'T' separator and treats naive datetimes as UTC
  let safeString = dateString.replace(" ", "T");
  if (!safeString.endsWith("Z") && !safeString.match(/[+-]\d{2}:?\d{2}$/)) {
    safeString += "Z";
  }
  
  const date = new Date(safeString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
