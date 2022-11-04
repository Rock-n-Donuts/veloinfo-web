export function getRelativeTime(locale, d1) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const units = {
        year: 24 * 60 * 60 * 1000 * 365,
        month: (24 * 60 * 60 * 1000 * 365) / 12,
        day: 24 * 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        minute: 60 * 1000,
        second: 1000,
    };

    const parsedDate = new Date(d1);
    const elapsed = parsedDate - new Date();
    const formattedTime = new Intl.DateTimeFormat(locale, { timeStyle: 'medium' }).format(parsedDate);
    let newString = formattedTime;
    if (elapsed <= 0) {
        for (let u in units) {
            if (Math.abs(elapsed) > units[u] || u === 'second') {
                newString =
                    rtf.format(Math.round(elapsed / units[u]), u);
                break;
            }
        }
    }
    return newString;
}
