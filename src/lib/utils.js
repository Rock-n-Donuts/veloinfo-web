import RelativeTimeFormat from 'relative-time-format';
import { parseISO } from 'date-fns';

export function parseDate(date, asUTC = true) {
    return parseISO(asUTC ? `${date.substr(0, 10)}T${date.substr(11, 18)}Z` : date);
}

export function getRelativeTime(locale, date, now = new Date()) {
    const rtf = new RelativeTimeFormat(locale);
    const units = {
        year: 24 * 60 * 60 * 1000 * 365,
        month: (24 * 60 * 60 * 1000 * 365) / 12,
        day: 24 * 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        minute: 60 * 1000,
        second: 1000,
    };

    const elapsed = parseDate(date) - now;

    let newString;
    for (let u in units) {
        if (Math.abs(elapsed) > units[u] || u === 'second') {
            newString = rtf.format(Math.round(elapsed / units[u]), u);
            break;
        }
    }

    return newString;
}
