// The CMS schedules content in the owner's timezone, regardless of the Node host timezone.
export const ownerTimeZone = "Asia/Ho_Chi_Minh";
export function publicationInput(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("sv-SE", {
        timeZone: ownerTimeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .format(date)
        .replace(" ", "T")
    : "";
}
export function publicationDate(value: string) {
  return new Date(
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}+07:00`,
  );
}
