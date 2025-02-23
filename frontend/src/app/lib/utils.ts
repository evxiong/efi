export function numberToOrdinal(n: number) {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

export function formatDate(
  dateString: string | Date,
  includeYear: boolean = true,
) {
  const date = new Date(dateString);
  const months = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec.",
  ];
  return includeYear
    ? `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
    : `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export function formatTime(date: Date) {
  const formatted = date
    .toLocaleTimeString([], {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    })
    .replace(" PM", "pm")
    .replace(" AM", "am");
  if (!formatted.includes(",")) {
    return formatted.replace(" ", ", ");
  }
  return formatted;
}
