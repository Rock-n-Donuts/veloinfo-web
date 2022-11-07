import { createContext, useContext, useMemo, useState } from 'react';

const FiltersContext = createContext();

export const FiltersProvider = ({ children }) => {
    const [fromDays, setFromDays] = useState(5);
    const [contributionTypes, setContributionTypes] = useState([1, 2, 3, 4]);
    const [tronconTypes, setTronconTypes] = useState(['winter-protected', 'winter']);

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
