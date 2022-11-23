import contributionTypes from '../data/contribution-types.json';
import tronconStates from '../data/troncon-states.json';
import getContributionSvg from '../icons/contributionSvg';

export function getLinesFromTroncons(troncons) {
    const unknownPaths = troncons.filter(
        ({ side_one_state: s1, side_two_state: s2 }) => s1 === null && s2 === null,
    );

    const clearedPaths = troncons.filter(
        ({ side_one_state: s1, side_two_state: s2 }) => s1 === 1 && s2 === 1,
    );
    const snowyPaths = troncons.filter(
        ({ side_one_state: s1, side_two_state: s2 }) => s1 === 0 || s2 === 0,
    );
    const planifiedPaths = troncons.filter(
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

    const clearingPaths = troncons.filter(
        ({ side_one_state: s1, side_two_state: s2 }) => s1 === 5 || s2 === 5,
    );

    // console.log(
    //     troncons.length,
    //     unknownPaths.length +
    //         clearedPaths.length +
    //         snowyPaths.length +
    //         planifiedPaths.length +
    //         clearingPaths.length,
    //     `Unknown: ${unknownPaths.length} Cleared: ${clearedPaths.length} Snowy: ${snowyPaths.length} Planified: ${planifiedPaths.length} Clearing: ${clearingPaths.length}`,
    // );

    return [
        {
            features: unknownPaths.map(({ coords, ...troncon }) => ({
                coords,
                data: troncon,
            })),
            color: tronconStates.find(({ key }) => key === 'unknown').color,
        },
        {
            features: clearedPaths.map(({ coords, ...troncon }) => ({
                coords,
                data: troncon,
            })),
            color: tronconStates.find(({ key }) => key === 'cleared').color,
        },
        {
            features: snowyPaths.map(({ coords, ...troncon }) => ({
                coords,
                data: troncon,
            })),
            color: tronconStates.find(({ key }) => key === 'snowy').color
        },
        {
            features: planifiedPaths.map(({ coords, ...troncon }) => ({
                coords,
                data: troncon,
            })),
            color: tronconStates.find(({ key }) => key === 'planified').color
        },
        {
            features: clearingPaths.map(({ coords, ...troncon }) => ({
                coords,
                data: troncon,
            })),
            color: tronconStates.find(({ key }) => key === 'clearing').color
        },
    ];
}

export function getMarkersFromContributions(contributions) {
    const icons = contributionTypes
        .reduce((all, curr) => {
            const { qualities = null, id, icon } = curr;
            if (qualities !== null) {
                const qualityIcons = qualities.map((quality) => ({
                    ...quality,
                    quality: true,
                    id,
                    icon,
                }));
                const grayQualityIcons = qualityIcons.map((icon) => ({ ...icon, gray: true }));
                return [...all, ...qualityIcons, grayQualityIcons[0]];
            } else {
                return [...all, curr, { ...curr, gray: true }];
            }
        }, [])
        .reverse();

    const groupedMarkers = icons.map(
        ({ id, icon, color, quality = false, value, gray = false, withoutMarker }) => {
            const finalColor = gray ? '#999' : color;
            return {
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
                src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                    getContributionSvg({ icon, color: finalColor, withoutMarker }),
                )}`,
                scale: `${id}` === '1' ? 1 : 0.5,
                gray,
                id,
                icon,
                value,
                color: finalColor
            };
        },
    );

    // console.log(contributions.length, groupedMarkers.reduce((total, { features }) => total + features.length, 0))

    return groupedMarkers;
}
