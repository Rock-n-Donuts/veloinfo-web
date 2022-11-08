import { parseISO, addDays } from 'date-fns';

export const getFilteredTroncons = (troncons, filters) => {
    const { tronconTypes = [] } = filters || {};
    return [...(troncons || [])].filter(({ winter, winter_protected }) => {
        const validWinterProtected =
            winter_protected === 1 && tronconTypes.indexOf('winter-protected') > -1;
        const validWinter =
            winter === 1 && winter_protected === 0 && tronconTypes.indexOf('winter') > -1;
        const validUncleared = winter === 0 && tronconTypes.indexOf('uncleared') > -1;

        return validWinter || validUncleared || validWinterProtected;
    });
};

export const getFilteredContributions = (contributions, filters) => {
    const { contributionTypes = [], fromDays = null } = filters || {};
    return [...(contributions || [])]
        .filter(({ issue_id }) => contributionTypes.indexOf(parseInt(issue_id)) > -1)
        .filter(
            ({ issue_id, created_at }) =>
                issue_id !== 1 || fromDays === null || addDays(new Date(), -fromDays) < parseISO(created_at),
        );
};
