import { shouldPolyfill } from '@formatjs/intl-relativetimeformat/should-polyfill';
async function polyfill(locale) {
    const unsupportedLocale = shouldPolyfill(locale);
    // This locale is supported
    if (!unsupportedLocale) {
        return;
    }
    // Load the polyfill 1st BEFORE loading data
    await import('@formatjs/intl-relativetimeformat/polyfill-force');
    await import(`@formatjs/intl-relativetimeformat/locale-data/${unsupportedLocale}`);
}
export default polyfill;
