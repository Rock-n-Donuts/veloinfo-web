import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useUser } from './AuthContext';
import { useSelectedFilters } from './FiltersContext';
import { getLinesFromTroncons, getMarkersFromContributions } from '../lib/map';
import { getFilteredContributions, getFilteredTroncons } from '../lib/filters';

const DataContext = createContext();
const pollingDelay = 100; // seconds

export const DataProvider = ({ children }) => {
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [filteredData, setFilteredData] = useState(data);
    const [mapData, setMapData] = useState({ lines: [], markers: [] });
    const user = useUser();
    const selectedFilters = useSelectedFilters();

    const { date = null } = data || {};

    const getData = useCallback((date = null) => {
        setLoading(true);
        setError(null);
        axios
            .request({
                url: '/update',
                method: 'get',
                params: {
                    from: date,
                },
            })
            .then((res) => {
                const { data: newData = null } = res || {};
                const { date: newDate = null } = newData || {};
                if (date === null) {
                    // console.log('Initial data received', newData);
                    setReady(true);
                    setData(newData);
                } else {
                    // console.log('Updated data received.', newData);
                    if (date !== newDate)
                        setData((old) => {
                            const { troncons, contributions } = old || {};
                            const {
                                troncons: updatedTroncons,
                                contributions: updatedContributions,
                                date: updatedDate,
                            } = newData || {};
                            const mergedTroncons = [...troncons];
                            const mergedContributions = [...contributions];
                            updatedTroncons.forEach((troncon) => {
                                const foundIndex = troncons.findIndex(
                                    ({ id }) => id === troncon.id,
                                );
                                if (foundIndex >= 0) {
                                    mergedTroncons[foundIndex] = troncon;
                                } else {
                                    mergedTroncons.push(troncon);
                                }
                            });
                            updatedContributions.forEach((contribution) => {
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
                                date: updatedDate,
                            };
                            return mergedData;
                        });
                }
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user !== null) {
            // console.log('Getting initial data...');
            getData();
        }
    }, [getData, user]);

    useEffect(() => {
        if (date !== null) {
            // console.log('Updating data...');
            setTimeout(() => {
                getData(date);
            }, [pollingDelay * 1000]);
        }
    }, [getData, date]);

    const filterData = useCallback((newData, newFilters) => {
        const { troncons = null, contributions = null } = newData;

        return {
            ...newData,
            troncons: getFilteredTroncons(troncons, newFilters),
            contributions: getFilteredContributions(contributions, newFilters),
        };
    }, []);

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
        <DataContext.Provider value={{ data, filteredData, mapData, ready, loading, error, setData }}>
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

export const useAddContribution = () => {
    const ctx = useDataContext(DataContext);
    const { setData } = ctx || {};

    const addContribution = useCallback(
        (contribution) => {
            setData((old) => {
                const { contributions } = old || {};
                return { ...old, contributions: [...contributions, contribution] };
            });
        },
        [setData],
    );
    return addContribution;
};

export const useUpdateContribution = () => {
    const ctx = useDataContext(DataContext);
    const { setData } = ctx || {};

    const updateContribution = useCallback(
        (updatedContribution) => {
            setData((old) => {
                const { id: updatedContributionId } = updatedContribution;
                const { contributions } = old || {};
                const foundContributionIndex = contributions.findIndex(({ id }) => {
                    return parseInt(id) === parseInt(updatedContributionId);
                });
                const newContributions = [...contributions];
                if (foundContributionIndex >= 0) {
                    newContributions[foundContributionIndex] = updatedContribution;
                    return { ...old, contributions: newContributions };
                }
                return old;
            });
        },
        [setData],
    );
    return updateContribution;
};

export default DataContext;
