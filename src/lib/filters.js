import { addDays, addHours } from 'date-fns';

import { parseDate } from './utils';
import timeChoices from '../data/time-filter-choices.json';

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
    const { contributionTypes = [], fromTime: fromTimeKey = null } = filters || {};
    const fromTime = timeChoices.find(({ key }) => key === fromTimeKey) || null;

    return [...(contributions || [])]
        .map((contribution) => {
            const { issue_id, created_at } = contribution;
            const validType = contributionTypes.indexOf(`${issue_id}`) > -1;
            const { days = 0, hours = 0 } = fromTime || {};

            const validStatefromTime =
                issue_id !== 1 ||
                fromTime === null ||
                addDays(addHours(new Date(), -hours), -days) < parseDate(created_at);
            const visible = validType && validStatefromTime;
            return { ...contribution, visible };
        })
        .filter(({ visible }) => visible);
};
