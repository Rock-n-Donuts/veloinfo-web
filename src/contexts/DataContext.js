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
import { useWinterMode } from './SiteContext';
import { getLinesFromTroncons, getMarkersFromContributions } from '../lib/map';
import { getFilteredContributions, getFilteredTroncons } from '../lib/filters';

const DataContext = createContext();
const pollingDelay = 10; // seconds
const useRawData = true;

export const DataProvider = ({ children }) => {
    const winterMode = useWinterMode();
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
    
    const getParsedData = useCallback((data) => {
        const { contributions = [], date, replies, votes, urlprefix, troncons = [] } = data || {};

        const votesByContributions = votes.reduce((all, { contribution_id, ...vote }) => {
            if (typeof all[contribution_id] === 'undefined') {
                all[contribution_id] = [];
            }
            all[contribution_id].push(vote);
            return all;
        }, {});

        const repliesByContributions = replies.reduce((all, { contribution_id, ...reply }) => {
            if (typeof all[contribution_id] === 'undefined') {
                all[contribution_id] = [];
            }
            all[contribution_id].push(reply);
            return all;
        }, {});

        return {
            contributions: contributions.map(({
                id = null,
                location = '0,0',
                is_external = false,
                external_photo = false,
                photo_width = null,
                photo_height = null,
                photo_path = null,
                created_at = null,
                ...c
            }) => {
                const imageUrl = is_external ? external_photo : (photo_path !== null ? `${urlprefix}/uploads/${photo_path}` : null);
                const contributionVotes = votesByContributions[id] || [];
                const lastVote = contributionVotes.length > 0 ? contributionVotes[contributionVotes.length - 1] : null;
                const { score: lastVoteScore = null, created_at: lastVoteDate = null } = lastVote || {};

                const contributionReplies = repliesByContributions[id] || [];
                const lastReply = contributionReplies.length > 0 ? contributionReplies[contributionReplies.length - 1] : null;
                const { created_at: lastReplyDate = null } = lastReply || {};
                let updatedAt = created_at;
                if (lastVoteDate !== null && lastReplyDate !== null) {
                    updatedAt = (lastVoteDate > lastReplyDate) ? lastVoteDate : lastReplyDate;
                } else if (lastVoteDate !== null) {
                    updatedAt = lastVoteDate;
                } else if (lastReplyDate !== null) {
                    updatedAt = lastReplyDate;
                }

                return {
                    ...c,
                    id,
                    coords: location.split(','),
                    is_external,
                    image: {
                        url: imageUrl,
                        width: photo_width,
                        height: photo_height,
                        is_external,
                    },
                    score: {
                        positive: contributionVotes.filter(({ score }) => score > 0).length,
                        negative: contributionVotes.filter(({ score }) => score < 0).length,
                        last_vote: lastVoteScore,
                        last_vote_date: lastVoteDate
                    },
                    replies: contributionReplies,
                    created_at,
                    updated_at: updatedAt
                }
            }),
            troncons,
            date,
        };
    }, []);

    const getData = useCallback(() => {
        setLoading(true);
        setError(null);
        axios
            .request({
                url: useRawData ? '/raw' : useRawData,
                method: 'get',
                params: {
                    from: dateRef.current,
                    troncons: useRawData ? null : winterMode
                },
            })
            .then((res) => {
                const { data: receivedData = null } = res || {};
                const newData = useRawData ? getParsedData(receivedData) : receivedData;
                const {
                    date: newDate = null,
                    troncons: newTroncons,
                    contributions: newContributions,
                } = newData || {};
                if (dateRef.current === null) {
                    // console.log('Initial data received', newData);
                    dateRef.current = newDate;
                    setData(newData);
                    setReady(true);
                    setInterval(getData, [pollingDelay * 1000]);
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
    }, [winterMode, getParsedData]);

    useEffect(() => {
        if (user !== null) {
            // console.log('Getting initial data...');
            getData();
        }
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

export const useContributions = () => {
    const data = useData();
    const { contributions = null } = data || {};

    return contributions;
};

export const useTroncons = () => {
    const data = useData();
    const { troncons = null } = data || {};

    return troncons;
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
