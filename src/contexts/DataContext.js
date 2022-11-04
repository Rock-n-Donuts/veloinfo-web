import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './AuthContext';
import useInterval from '../hooks/useInterval';

const DataContext = createContext();
const pollingDelay = 15; // seconds

export const DataProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useUser();

    const { date = null } = data || {};

    const getData = useCallback(
        (date = null) => {
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
                    // console.log('Data received.', newData);
                    if (date !== null) {
                        
                        setData((old) => {
                            const { troncons, contributions } = old || {};
                            const { troncons: updatedTroncons, contributions: updatedContributions, date: updatedDate } = newData || {};
                            const newTroncons = [...troncons];
                            const newContributions = [...contributions];
                            updatedTroncons.forEach(troncon => {
                                const foundIndex = troncons.findIndex(({ id }) => id === troncon.id);
                                if (foundIndex >= 0) {
                                    newTroncons[foundIndex] = troncon;
                                } else {
                                    newTroncons.push(troncon);
                                }
                            });
                            updatedContributions.forEach(contribution => {
                                const foundIndex = contributions.findIndex(({ id }) => id === contribution.id);
                                if (foundIndex >= 0) {
                                    newContributions[foundIndex] = contribution;
                                } else {
                                    newContributions.push(contribution);
                                }
                            });
                            return { contributions: newContributions, troncons: newTroncons, date: updatedDate };
                        })
                    } else {
                        setData(newData);
                    }
                    
                })
                .catch((err) => setError(err))
                .finally(() => setLoading(false));
        },
        [setData, setError, setLoading],
    );

    useEffect(() => {
        if (user !== null) {
            // console.log('Getting initial data...');
            getData();
        }
    }, [getData, user]);

    useInterval(() => {
        if (user !== null) {
            // console.log('Updating data...');
            getData(date);
        }
    }, pollingDelay * 1000);

    return (
        <DataContext.Provider value={{ data, loading, error, setData }}>
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

export const useTroncons = () => {
    const data = useData();
    const { troncons = null } = data || {};
    return troncons;
};

export const useContributions = () => {
    const data = useData();
    const { contributions = null } = data || {};
    return contributions;
};

export const useDataDate = () => {
    const data = useData();
    const { date = null } = data || {};
    return date;
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
