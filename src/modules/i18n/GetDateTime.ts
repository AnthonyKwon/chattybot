export function getRelativeTime(locale: string, value: number, unit: Intl.RelativeTimeFormatUnit) {
    const relative = new Intl.RelativeTimeFormat(locale, { style: "long", numeric: "auto" });
    return relative.format(value, unit);
}