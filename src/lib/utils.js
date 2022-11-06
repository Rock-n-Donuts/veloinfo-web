import RelativeTimeFormat from 'relative-time-format';
import { parseISO } from 'date-fns';

export function getRelativeTime(locale, date) {
    const rtf = new RelativeTimeFormat(locale);
    const units = {
        year: 24 * 60 * 60 * 1000 * 365,
        month: (24 * 60 * 60 * 1000 * 365) / 12,
        day: 24 * 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        minute: 60 * 1000,
        second: 1000,
    };

    // Date from SQL needs to be converted to
    // let dateString = date;
    // if (date.indexOf(' ') === 10) {
    //     dateString = `${date.substr(0, 10)}T${date.substr(11)}`;
    // }

    const parsedDate = parseISO(date);
    const elapsed = parsedDate - new Date();

    let newString;
    for (let u in units) {
        if (Math.abs(elapsed) > units[u] || u === 'second') {
            newString = rtf.format(Math.round(elapsed / units[u]), u);
            break;
        }
    }

    return newString;
}
