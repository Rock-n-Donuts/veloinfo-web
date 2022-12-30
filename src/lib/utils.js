import RelativeTimeFormat from 'relative-time-format';
import { parseISO } from 'date-fns';
import DeviceDetector from 'device-detector-js';

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

export function isDeviceMobile() {
    const deviceDetector = new DeviceDetector();
    const result = deviceDetector.parse(navigator.userAgent);
    const { device } = result || {};
    const { type } = device || {};
    return type !== 'desktop';
}

export function DMS2DD(degrees, minutes, seconds, direction) {
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
        dd = dd * -1;
    }
    return dd;
}

export function exifToCoords(exif) {
    const { GPSLatitude = null, GPSLongitude = null, GPSLatitudeRef = null, GPSLongitudeRef = null } = exif || {};

    if (GPSLatitude === null || GPSLongitude === null || GPSLatitudeRef === null || GPSLongitudeRef === null) {
        return null;
    }

    const latDeg = GPSLatitude[0];
    const latMin = GPSLatitude[1];
    const latSec = GPSLatitude[2];
    const latDir = GPSLatitudeRef;
    const lat = DMS2DD(latDeg, latMin, latSec, latDir);

    const lngDeg = GPSLongitude[0];
    const lngMin = GPSLongitude[1];
    const lngSec = GPSLongitude[2];
    const lngDir = GPSLongitudeRef;
    const lng = DMS2DD(lngDeg, lngMin, lngSec, lngDir);

    return [lng, lat];
}
