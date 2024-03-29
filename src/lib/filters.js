import { addDays, addHours, isBefore } from 'date-fns';

import { parseDate } from './utils';
import timeChoices from '../data/time-filter-choices.json';

export const getFilteredTroncons = (troncons, filters) => {
    const { tronconsTypes = [] } = filters || {};
    return [...(troncons || [])].map((troncon) => {
        const { winter, winter_protected } = troncon;
        const validWinterProtected =
            winter_protected === 1 && tronconsTypes.indexOf('winter-protected') > -1;
        const validWinter =
            winter === 1 && winter_protected === 0 && tronconsTypes.indexOf('winter') > -1;
        const validUncleared = winter === 0 && tronconsTypes.indexOf('uncleared') > -1;

        const visible = validWinter || validUncleared || validWinterProtected;
        return { ...troncon, visible };
    });
};

export const getFilteredContributions = (contributions, filters) => {
    const { contributionsTypes = [], fromTime: fromTimeKey = null } = filters || {};
    const fromTime = timeChoices.find(({ key }) => key === fromTimeKey) || null;

    return [...(contributions || [])].map((contribution) => {
        const { issue_id, updated_at } = contribution;
        const validType = contributionsTypes.indexOf(`${issue_id}`) > -1;
        const { days = 0, hours = 0 } = fromTime || {};

        const validStatefromTime =
            `${issue_id}` !== `${1}` ||
            fromTime === null ||
            isBefore(addDays(addHours(new Date(), -hours), -days), parseDate(updated_at));
        
        const visible = validType && validStatefromTime;
        return { ...contribution, visible };
    });
};
