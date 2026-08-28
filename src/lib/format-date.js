export function formatRelativeDate(dateString) {
  const inputDate = new Date(dateString);
  const now = new Date();
  const diffMs = now - inputDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    const day = inputDate.getDate().toString().padStart(2, "0");
    const month = inputDate.toLocaleString("en-US", { month: "short" });
    const year = inputDate.getFullYear();
    const hours = inputDate.getHours().toString().padStart(2, "0");
    const minutes = inputDate.getMinutes().toString().padStart(2, "0");

    return `${month} ${day}, ${year} at ${hours}:${minutes}`;
  }
}
