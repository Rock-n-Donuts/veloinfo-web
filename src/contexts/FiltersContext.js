import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FiltersContext = createContext();
const defaultfromTime = '5days';
const defaultTronconsTypes = ['winter-protected', 'winter'];
const defaultContributionTypes = [1, 2];

export const FiltersProvider = ({ children }) => {
    let cookiesFilters = null;
    try {
        cookiesFilters = JSON.parse(Cookies.get('filters') || null);
    } catch {}

    const { fromTime: cookieFromTime = null,
        tronconTypes: cookieTronconsTypes = null,
        contributionTypes: cookieContributionTypes = null, } = cookiesFilters || {};

    const defaultFilters = {
        fromTime: cookieFromTime !== null ? cookieFromTime : defaultfromTime,
        tronconTypes: cookieTronconsTypes !== null ? cookieTronconsTypes : defaultTronconsTypes,
        contributionTypes: cookieContributionTypes !== null ? cookieContributionTypes : defaultContributionTypes,
    }

    const [fromTime, setFromTime] = useState(defaultFilters.fromTime);
    const [contributionTypes, setContributionTypes] = useState(defaultFilters.contributionTypes);
    const [tronconTypes, setTronconTypes] = useState(defaultFilters.tronconTypes);

    useEffect(() => {
        Cookies.set('filters', JSON.stringify({ fromTime, contributionTypes, tronconTypes }), {
            expires: 3650,
        });
    }, [fromTime, contributionTypes, tronconTypes]);

    return (
        <FiltersContext.Provider
            value={{
                fromTime,
                contributionTypes,
                tronconTypes,
                setFromTime,
                setContributionTypes,
                setTronconTypes,
            }}
        >
            {children}
        </FiltersContext.Provider>
    );
};

export const useFilters = () => {
    const ctx = useContext(FiltersContext);
    if (ctx === undefined) {
        throw new Error('useFilters can only be used inside FiltersProvider');
    }
    return ctx || {};
};

export const useSelectedFilters = () => {
    const { fromTime, contributionTypes, tronconTypes } = useFilters();
    const filters = useMemo(
        () => ({ fromTime, contributionTypes, tronconTypes }),
        [fromTime, contributionTypes, tronconTypes],
    );
    return filters;
};

export const useSetFilters = () => {
    const { setFromTime, setContributionTypes, setTronconTypes } = useFilters();
    const setFilters = useMemo(
        () => ({ setFromTime, setContributionTypes, setTronconTypes }),
        [setFromTime, setContributionTypes, setTronconTypes],
    );
    return setFilters;
};

export default FiltersContext;
