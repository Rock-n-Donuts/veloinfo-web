import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FiltersContext = createContext();

const defaultFromDays = 5;
const defaultTronconsTypes = ['winter-protected', 'winter'];
const defaultContributionTypes = [1, 2, 3, 4];

export const FiltersProvider = ({ children }) => {
    let defaultFilters = null;
    try {
        defaultFilters = JSON.parse(Cookies.get('filters') || null);
    } catch {}

    if (defaultFilters === null) {
        defaultFilters = {
            fromDays: defaultFromDays,
            tronconTypes: defaultTronconsTypes,
            contributionTypes: defaultContributionTypes,
        };
    }

    const [fromDays, setFromDays] = useState(defaultFilters.fromDays);
    const [contributionTypes, setContributionTypes] = useState(defaultFilters.contributionTypes);
    const [tronconTypes, setTronconTypes] = useState(defaultFilters.tronconTypes);

    useEffect(() => {
        Cookies.set('filters', JSON.stringify({ fromDays, contributionTypes, tronconTypes }), {
            expires: 3650,
        });
    }, [fromDays, contributionTypes, tronconTypes]);

    return (
        <FiltersContext.Provider
            value={{
                fromDays,
                contributionTypes,
                tronconTypes,
                setFromDays,
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
    const { fromDays, contributionTypes, tronconTypes } = useFilters();
    const filters = useMemo(
        () => ({ fromDays, contributionTypes, tronconTypes }),
        [fromDays, contributionTypes, tronconTypes],
    );
    return filters;
};

export const useSetFilters = () => {
    const { setFromDays, setContributionTypes, setTronconTypes } = useFilters();
    const setFilters = useMemo(
        () => ({ setFromDays, setContributionTypes, setTronconTypes }),
        [setFromDays, setContributionTypes, setTronconTypes],
    );
    return setFilters;
};

export default FiltersContext;
