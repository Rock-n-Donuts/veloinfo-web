import { createContext, useContext, useState } from 'react';

const FiltersContext = createContext();

export const FiltersProvider = ({ children }) => {
    const [fromDays, setFromDays] = useState(5);
    const [contributionTypes, setContributionTypes] = useState([]);
    const [tronconsTypes, setTronconsTypes] = useState([]);

    return (
        <FiltersContext.Provider
            value={{
                fromDays,
                setFromDays,
                contributionTypes,
                setContributionTypes,
                tronconsTypes,
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

export default FiltersContext;
