import { createContext, useContext, useState } from 'react';

const FiltersContext = createContext();

export const FiltersProvider = ({ children }) => {
    const [fromDays, setFromDays] = useState(5);
    const [contributionTypes, setContributionTypes] = useState([1, 2, 3, 4]);
    const [tronconTypes, setTronconTypes] = useState(['winter-protected', 'winter']);

    return (
        <FiltersContext.Provider
            value={{
                fromDays,
                setFromDays,
                contributionTypes,
                setContributionTypes,
                tronconTypes,
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

export default FiltersContext;
