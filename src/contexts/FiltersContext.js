import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import tronconTypes from '../data/troncon-types.json';

const FiltersContext = createContext();
const defaultfromTime = '5days';
const defaultTronconsTypes = tronconTypes.map(({ key }) => key);
const defaultContributionTypes = [1, 2, 6];

export const FiltersProvider = ({ children }) => {
    let cookiesFilters = null;
    try {
        cookiesFilters = JSON.parse(Cookies.get('filters') || null);
    } catch {}

    const {
        fromTime: cookieFromTime = null,
        tronconsTypes: cookieTronconsTypes = null,
        contributionsTypes: cookieContributionTypes = null,
    } = cookiesFilters || {};

    const defaultFilters = {
        fromTime: cookieFromTime !== null ? cookieFromTime : defaultfromTime,
        tronconsTypes: cookieTronconsTypes !== null ? cookieTronconsTypes : defaultTronconsTypes,
        contributionsTypes:
            cookieContributionTypes !== null
                ? cookieContributionTypes.map((id) => `${id}`)
                : defaultContributionTypes.map((id) => `${id}`),
    };

    

    const [fromTime, setFromTime] = useState(defaultFilters.fromTime);
    const [contributionsTypes, setContributionsTypes] = useState(defaultFilters.contributionsTypes);
    const [tronconsTypes, setTronconsTypes] = useState(defaultFilters.tronconsTypes);

    useEffect(() => {
        Cookies.set('filters', JSON.stringify({ fromTime, contributionsTypes, tronconsTypes }), {
            expires: 3650,
        });
    }, [fromTime, contributionsTypes, tronconsTypes]);

    return (
        <FiltersContext.Provider
            value={{
                fromTime,
                contributionsTypes,
                tronconsTypes,
                setFromTime,
                setContributionsTypes,
                setTronconsTypes,
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
    const { fromTime, contributionsTypes, tronconsTypes } = useFilters();
    const filters = useMemo(
        () => ({ fromTime, contributionsTypes, tronconsTypes }),
        [fromTime, contributionsTypes, tronconsTypes],
    );
    return filters;
};

export const useSetFilters = () => {
    const { setFromTime, setContributionsTypes, setTronconsTypes } = useFilters();
    const setFilters = useMemo(
        () => ({ setFromTime, setContributionsTypes, setTronconsTypes }),
        [setFromTime, setContributionsTypes, setTronconsTypes],
    );
    return setFilters;
};

export default FiltersContext;
