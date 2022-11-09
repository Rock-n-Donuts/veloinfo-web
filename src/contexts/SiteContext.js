import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useState } from 'react';

const SiteContext = createContext();

export const SiteProvider = ({ children }) => {

    const [locale, setLocale] = useState(Cookies.get('locale') || navigator.language.split(/[-_]/)[0]);

    useEffect(() => {
        Cookies.set('locale', locale);
    }, [locale]);

    return (
        <SiteContext.Provider
            value={{
                locale,
                setLocale,
            }}
        >
            {children}
        </SiteContext.Provider>
    );
};

export const useSite = () => {
    const ctx = useContext(SiteContext);
    if (ctx === undefined) {
        throw new Error('useSite can only be used inside SiteProvider');
    }
    return ctx || {};
};

export const useLocale = () => {
    const { locale } = useSite();
    return locale;
};

export const useSetLocale = () => {
    const { setLocale } = useSite();
    return setLocale;
};

export default SiteContext;
