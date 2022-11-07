import contributionTypes from '../data/contributions-types.json';
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
                // const grayQualityIcons = qualityIcons.map((icon) => ({...icon, gray: true}));
                return [
                    ...all,
                    ...qualityIcons,
                    // grayQualityIcons[0]
                ];
            } else {
                return [
                    ...all,
                    curr,
                    // {...curr, gray: true}
                ];
            }
        }, [])
        .reverse();

    const groupedMarkers = icons.map(({ id, icon, color, quality, value, gray = false }) => ({
        features: contributions
            .filter(({ issue_id, quality: contributionQuality }) =>
                quality ? contributionQuality === value : parseInt(issue_id) === parseInt(id),
            )
            .map(({ coords, ...contribution }) => ({
                coords,
                data: contribution,
                clickable: true,
            })),
        src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            getContributionSvg({ icon, color: gray ? '#000' : color }),
        )}`,
        scale: parseInt(id) === 1 ? 1 : 0.75,
    }));

    return groupedMarkers;
}
