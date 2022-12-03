import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import axios from 'axios';

import { useUser } from './AuthContext';
import { useSelectedFilters } from './FiltersContext';
import { getLinesFromTroncons, getMarkersFromContributions } from '../lib/map';
import { getFilteredContributions, getFilteredTroncons } from '../lib/filters';

const DataContext = createContext();
const pollingDelay = 10; // seconds

export const DataProvider = ({ children }) => {
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [filteredData, setFilteredData] = useState(data);
    const [mapData, setMapData] = useState({ lines: [], markers: [] });
    const user = useUser();
    const selectedFilters = useSelectedFilters();

    const dateRef = useRef(null);

    const filterData = useCallback((newData, newFilters) => {
        const { troncons = null, contributions = null } = newData;

        return {
            ...newData,
            troncons: getFilteredTroncons(troncons, newFilters),
            contributions: getFilteredContributions(contributions, newFilters),
        };
    }, []);

    const getData = useCallback(() => {
        setLoading(true);
        setError(null);
        axios
            .request({
                url: '/update',
                method: 'get',
                params: {
                    from: dateRef.current,
                },
            })
            .then((res) => {
                const { data: newData = null } = res || {};
                const {
                    date: newDate = null,
                    troncons: newTroncons,
                    contributions: newContributions,
                } = newData || {};
                if (dateRef.current === null) {
                    // console.log('Initial data received', newData);
                    setReady(true);
                    dateRef.current = newDate;
                    setData(newData);
                } else {
                    // console.log('Updated data received.', newData);
                    if (dateRef.current !== newDate) {
                        dateRef.current = newDate;
                    }

                    if (newTroncons.length > 0 || newContributions.length > 0) {
                        setData((old) => {
                            const { troncons, contributions } = old || {};
                            const mergedTroncons = [...troncons];
                            const mergedContributions = [...contributions];
                            newTroncons.forEach((troncon) => {
                                const foundIndex = troncons.findIndex(
                                    ({ id }) => id === troncon.id,
                                );
                                if (foundIndex >= 0) {
                                    mergedTroncons[foundIndex] = troncon;
                                } else {
                                    mergedTroncons.push(troncon);
                                }
                            });
                            newContributions.forEach((contribution) => {
                                const foundIndex = contributions.findIndex(
                                    ({ id }) => id === contribution.id,
                                );
                                if (foundIndex >= 0) {
                                    mergedContributions[foundIndex] = contribution;
                                } else {
                                    mergedContributions.push(contribution);
                                }
                            });
                            const mergedData = {
                                contributions: mergedContributions,
                                troncons: mergedTroncons,
                                date: newDate,
                            };
                            return mergedData;
                        });
                    }
                }
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let interval = null;

        if (user !== null) {
            // console.log('Getting initial data...');
            getData();
            interval = setInterval(() => {
                // console.log('Updating data...');
                getData();
            }, [pollingDelay * 1000]);
        }

        return () => {
            if (interval !== null) {
                clearInterval(interval);
                interval = null;
            }
        };
    }, [getData, user]);

    useEffect(() => {
        if (data !== null) {
            const filteredData = filterData(data, selectedFilters);
            const { troncons, contributions } = filteredData || {};
            const lines = getLinesFromTroncons(troncons);
            const markers = getMarkersFromContributions(contributions);

            setFilteredData(filteredData);
            setMapData({ lines, markers });
        }
    }, [data, selectedFilters, filterData]);

    return (
        <DataContext.Provider
            value={{ data, filteredData, mapData, ready, loading, error, setData }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const ctx = useContext(DataContext);
    if (ctx === undefined) {
        throw new Error('useData can only be used inside DataProvider');
    }
    return ctx;
};

export const useData = () => {
    const ctx = useDataContext(DataContext);
    const { data = null } = ctx || {};

    return data;
};

export const useReady = () => {
    const ctx = useDataContext(DataContext);
    const { ready } = ctx || {};
    return ready;
};

export const useContribution = (selectedId) => {
    const { contributions = null } = useData() || {};
    const contribution = useMemo(
        () =>
            contributions !== null
                ? contributions.find(({ id }) => `${id}` === `${selectedId}`) || null
                : null,
        [contributions, selectedId],
    );

    return contribution;
};

export const useMapData = () => {
    const ctx = useDataContext(DataContext);
    const { mapData } = ctx || {};
    return mapData;
};

export const useUpdateContribution = () => {
    const ctx = useDataContext(DataContext);
    const { setData } = ctx || {};

    const updateContribution = useCallback(
        (updatedContribution) => {
            setData((old) => {
                const { id: updatedContributionId } = updatedContribution;
                const { contributions } = old || {};
                const foundContributionIndex = contributions.findIndex(
                    ({ id }) => `${id}` === `${updatedContributionId}`,
                );
                const newContributions = [...contributions];
                if (foundContributionIndex >= 0) {
                    newContributions[foundContributionIndex] = updatedContribution;
                    return { ...old, contributions: newContributions };
                }
                newContributions.push(updatedContribution);
                return { ...old, contributions: newContributions };
            });
        },
        [setData],
    );
    return updateContribution;
};

export const useAddContribution = useUpdateContribution;

export default DataContext;
