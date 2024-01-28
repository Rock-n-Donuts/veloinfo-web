import Cookies from 'js-cookie';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SiteContext = createContext();

const getDefaultContribution = () => {
    return {
        name: Cookies.get('name') || null,
    };
};

export const SiteProvider = ({ children }) => {
    const [locale, setLocale] = useState(
        Cookies.get('locale') || navigator.language.split(/[-_]/)[0],
    );
    const [userContributions, setUserContributions] = useState([]);
    const [winterMode, setWinterMode] = useState(Cookies.get('winterMode') === 'true' || false);
    const [customMapLayer, setCustomMapLayer] = useState(Cookies.get('customMapLayer') === 'true' || false);

    useEffect(() => {
        Cookies.set('locale', locale);
    }, [locale]);

    useEffect(() => {
        Cookies.set('customMapLayer', customMapLayer);
    }, [customMapLayer]);

    return (
        <SiteContext.Provider
            value={{
                locale,
                setLocale,
                userContributions,
                setUserContributions,
                winterMode,
                setWinterMode,
                customMapLayer,
                setCustomMapLayer
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

export const useWinterMode = () => {
    const { winterMode } = useSite();
    return winterMode;
};

export const useSetWinterMode = () => {
    const { setWinterMode } = useSite();
    return setWinterMode;
};

export const useCustomMapLayer = () => {
    const { customMapLayer } = useSite();
    return customMapLayer;
};

export const useSetCustomMapLayer = () => {
    const { setCustomMapLayer } = useSite();
    return setCustomMapLayer;
};

export const useUserContributions = () => {
    const { userContributions } = useSite();
    return userContributions;
};

export const useUserContribution = (index) => {
    const { userContributions } = useSite();
    const contribution = useMemo(
        () => (userContributions.length > index ? userContributions[index] : null),
        [userContributions, index],
    );
    return contribution;
};

export const useUserCurrentContribution = () => {
    const { userContributions } = useSite();
    const contribution = useMemo(
        () => (userContributions.length > 0 ? userContributions[0] : null),
        [userContributions],
    );
    return contribution;
};

export const useAddUserContribution = () => {
    const { setUserContributions } = useSite();
    const cb = useCallback(
        (contribution = {}) => {
            setUserContributions((old) => [
                ...old,
                { ...getDefaultContribution(), ...contribution },
            ]);
        },
        [setUserContributions],
    );
    return cb;
};

export const useCompleteUserContribution = () => {
    const { setUserContributions } = useSite();
    const cb = useCallback(() => {
        setUserContributions((old) => {
            if (old && old.length > 0) {
                const { name = null } = old[0];
                if (name !== null && name.length > 0) {
                    Cookies.set('name', name, { expires: 3650 });
                }
                return old.slice(1);
            }
            return [];
        });
    }, [setUserContributions]);
    return cb;
};

export const useUserUpdateContribution = (contributionIndex = null) => {
    const { setUserContributions } = useSite();
    const cb = useCallback(
        (update, index = null) => {
            const finalIndex = index !== null ? index : contributionIndex;
            setUserContributions((old) => {
                const { [finalIndex || 0]: userContribution } = old;
                return [
                    { ...getDefaultContribution(), ...userContribution, ...update },
                    ...old.slice(finalIndex !== null ? finalIndex + 1 : 1),
                ];
            });
        },
        [setUserContributions, contributionIndex],
    );
    return cb;
};

export default SiteContext;
