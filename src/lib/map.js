// import getContributionSvg from '../icons/contributionSvg';

import contributionTypes from '../data/contribution-types.json';
import tronconStates from '../data/troncon-states.json';

export function getLinesFromTroncons(troncons) {
    // 0 Enneigé,
    // 1 Déneigé, (seulement après un code 0)
    // 2 Planifié
    // 3 Replanifié (déplacé?)
    // 4 Sera planifié ulterieurement
    // 5 Chargement en cours
    // 10 Dégagé (entre 2 chargements) (entre 2 saisons aussi)

    const groupedFeatures = troncons.reduce(
        (all, curr) => {
            const { side_one_state: s1, side_two_state: s2 } = curr;
            const newObj = { ...all };

            if (s1 === 1 || s1 === 10 || s2 === 1 || s2 === 10) {
                if ((s1 === 1 || s1 === 10) && (s2 === 1 || s2 === 10)) {
                    newObj['cleared'].push(curr);
                } else {
                    newObj['partially-cleared'].push(curr);
                }
            } else if (s1 === 0 || s2 === 0) {
                newObj['snowy'].push(curr);
            } else if (s1 === 2 || s1 === 3 || s1 === 4 || s2 === 2 || s2 === 3 || s2 === 4) {
                newObj['planified'].push(curr);
            } else if (s1 === 5 || s2 === 5) {
                newObj['clearing'].push(curr);
            } else {
                newObj['unknown'].push(curr);
            }
            return newObj;
        },
        tronconStates.reduce(
            (acc, { key }) => ({
                ...acc,
                [key]: [],
            }),
            {},
        ),
    );

    return tronconStates.map(({ key, color }) => ({
        color,
        features: groupedFeatures[key].map(({ coords, ...data }) => ({ coords, data })),
    }));
}

export function getColoredIcons() {
    return contributionTypes.reduce((all, curr) => {
        const { qualities = null, id, icon } = curr;
        const gray = '#999';
        if (qualities !== null) {
            const qualityIcons = qualities.map((quality) => ({
                ...quality,
                quality: true,
                id,
                icon,
            }));
            const grayQualityIcons = qualityIcons.map((icon) => ({
                ...icon,
                gray: true,
                color: gray,
            }));
            return [...all, ...qualityIcons, grayQualityIcons[0]];
        } else {
            return [...all, curr, { ...curr, gray: true, color: gray }];
        }
    }, []);
}

export function getMarkersFromContributions(contributions) {
    return getColoredIcons()
        .map(({ id, icon, color, quality = false, value, gray = false, withoutMarker }) => ({
            features: contributions
                .filter(
                    ({ quality: contributionQuality, score }) =>
                        !quality ||
                        (gray && `${score.last_vote}` === '-1') ||
                        `${contributionQuality}` === `${value}`,
                )
                .filter(
                    ({ score }) =>
                        (!gray && `${score.last_vote}` !== '-1') ||
                        (gray && `${score.last_vote}` === '-1'),
                )
                .filter(({ issue_id }) => `${issue_id}` === `${id}`)
                .map(({ coords, ...contribution }) => ({
                    coords,
                    data: contribution,
                    clickable: true,
                })),
            scale: `${id}` === '1' ? 1 : 0.5,
            id,
            icon,
            color,
            withoutMarker,
            value,
            // src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            //     getContributionSvg({ icon, color, withoutMarker }),
            // )}`
        }))
        .reverse();
}
