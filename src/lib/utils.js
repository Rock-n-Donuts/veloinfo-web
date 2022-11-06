import RelativeTimeFormat from 'relative-time-format';

export function getRelativeTime(locale, d1) {
    const rtf = new RelativeTimeFormat(locale);
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

    console.log(new Date(), new Date(d1), elapsed)

    let newString;
    for (let u in units) {
        if (Math.abs(elapsed) > units[u] || u === 'second') {
            console.log(elapsed);
            console.log(u);
            console.log(Math.round(elapsed / units[u]), u);
            newString = rtf.format(Math.round(elapsed / units[u]), u);
            break;
        }
    }

    return newString;
}
