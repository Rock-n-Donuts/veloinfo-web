import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './AuthContext';
import useInterval from '../hooks/useInterval';

import contributionTypes from '../data/contributions-types.json';
import getContributionSvg from '../icons/contributionSvg';

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
                            const {
                                troncons: updatedTroncons,
                                contributions: updatedContributions,
                                date: updatedDate,
                            } = newData || {};
                            const newTroncons = [...troncons];
                            const newContributions = [...contributions];
                            updatedTroncons.forEach((troncon) => {
                                const foundIndex = troncons.findIndex(
                                    ({ id }) => id === troncon.id,
                                );
                                if (foundIndex >= 0) {
                                    newTroncons[foundIndex] = troncon;
                                } else {
                                    newTroncons.push(troncon);
                                }
                            });
                            updatedContributions.forEach((contribution) => {
                                const foundIndex = contributions.findIndex(
                                    ({ id }) => id === contribution.id,
                                );
                                if (foundIndex >= 0) {
                                    newContributions[foundIndex] = contribution;
                                } else {
                                    newContributions.push(contribution);
                                }
                            });
                            return {
                                contributions: newContributions,
                                troncons: newTroncons,
                                date: updatedDate,
                            };
                        });
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

export const useLines = () => {
    const troncons = useTroncons();
    if (troncons !== null) {
        const unknownPaths = troncons.filter(
            ({ side_one_state: s1, side_two_state: s2 }) => s1 === null && s2 === null,
        );

        const clearedPaths = troncons.filter(
            ({ side_one_state: s1, side_two_state: s2 }) => s1 === 1 && s2 === 1,
        );
        const snowyPaths = troncons.filter(
            ({ side_one_state: s1, side_two_state: s2 }) => s1 === 0 || s2 === 0,
        );
        const panifiedPaths = troncons.filter(
            ({ side_one_state: s1, side_two_state: s2 }) =>
                s1 === 2 ||
                s1 === 3 ||
                s1 === 4 ||
                s1 === 10 ||
                s2 === 2 ||
                s2 === 3 ||
                s2 === 4 ||
                s2 === 10,
        );

        const inProgressPaths = troncons.filter(
            ({ side_one_state: s1, side_two_state: s2 }) => s1 === 5 || s2 === 5,
        );

        // console.log(
        //     troncons.length,
        //     unknownPaths.length +
        //         clearedPaths.length +
        //         snowyPaths.length +
        //         panifiedPaths.length +
        //         inProgressPaths.length,
        //     `Unknown: ${unknownPaths.length} Cleared: ${clearedPaths.length} Snowy: ${snowyPaths.length} Planified: ${panifiedPaths.length} In-progress: ${inProgressPaths.length}`,
        // );

        return [
            {
                features: unknownPaths.map(({ coords, ...troncon }) => ({
                    coords,
                    data: troncon,
                })),
                color: '#666666',
            },
            {
                features: clearedPaths.map(({ coords, ...troncon }) => ({
                    coords,
                    data: troncon,
                })),
                color: '#4fae77',
            },
            {
                features: snowyPaths.map(({ coords, ...troncon }) => ({
                    coords,
                    data: troncon,
                })),
                color: '#367c98',
            },
            {
                features: panifiedPaths.map(({ coords, ...troncon }) => ({
                    coords,
                    data: troncon,
                })),
                color: '#f09035',
            },
            {
                features: inProgressPaths.map(({ coords, ...troncon }) => ({
                    coords,
                    data: troncon,
                })),
                color: '#8962c7',
            },
        ];
    } else {
        return null;
    }
};

export const useMarkers = () => {
    const contributions = useContributions();

    if (contributions !== null) {
        const icons = contributionTypes.reduce((all, curr) => {
            const { qualities = null, id, icon } = curr;
            if (qualities !== null) {
                return [
                    ...all,
                    ...qualities.map((quality) => ({ ...quality, quality: true, id, icon })),
                ];
            } else {
                return [...all, curr];
            }
        }, []);

        return icons.map(({ id, icon, color, quality, value }) => ({
            features: contributions
                .filter(({ issue_id, quality: contributionQuality }) =>
                    quality
                        ? contributionQuality === value
                        : parseInt(issue_id) === parseInt(id),
                )
                .map(({ coords, ...contribution }) => ({
                    coords,
                    data: contribution,
                    clickable: true,
                })),
            src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                getContributionSvg({ icon, color }),
            )}`,
        }));
    } else {
        return null;
    }
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
