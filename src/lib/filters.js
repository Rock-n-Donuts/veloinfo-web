import { parseISO, addDays } from 'date-fns';

export const getFilteredTroncons = (troncons, filters) => {
    const { tronconTypes = [] } = filters || {};
    return [...(troncons || [])]
        .map((troncon) => {
            const { winter, winter_protected } = troncon;
            const validWinterProtected =
                winter_protected === 1 && tronconTypes.indexOf('winter-protected') > -1;
            const validWinter =
                winter === 1 && winter_protected === 0 && tronconTypes.indexOf('winter') > -1;
            const validUncleared = winter === 0 && tronconTypes.indexOf('uncleared') > -1;

            const visible = validWinter || validUncleared || validWinterProtected;
            return { ...troncon, visible };
        })
        .filter(({ visible }) => visible);
};

export const getFilteredContributions = (contributions, filters) => {
    const { contributionTypes = [], fromDays = 0 } = filters || {};
    return [...(contributions || [])]
        .map((contribution) => {
            const { issue_id, created_at } = contribution;
            const validType = contributionTypes.indexOf(parseInt(issue_id)) > -1;
            const validStateFromDays =
                issue_id !== 1 ||
                fromDays === 0 ||
                addDays(new Date(), -fromDays) < parseISO(created_at);

            const visible = validType && validStateFromDays;
            return { ...contribution, visible };
        })
        .filter(({ visible }) => visible);
};
