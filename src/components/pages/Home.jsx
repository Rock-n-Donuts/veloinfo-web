import { useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import Cookie from 'js-cookie';
import { v1 as uuid } from 'uuid';

import { useAddContribution, useData } from '../../contexts/DataContext';
import Map from '../partials/Map';
import MapHeader from '../partials/MapHeader';
import AddContributionButton from '../buttons/AddContribution';
import AddContribution from '../partials/AddContribution';
import HomeMenu from '../partials/HomeMenu';
import Loading from '../partials/Loading';
import ContributionDetails from '../partials/ContributionDetails';

import contributionTypes from '../../data/contributions-types.json';
import getContributionSvg from '../../icons/contributionSvg';

import styles from '../../styles/pages/home.module.scss';

function HomePage() {
    const [menuOpened, setMenuOpened] = useState(false);
    const [addContributionOpened, setAddContributionOpened] = useState(false);
    const [contributionSelected, setContributionSelected] = useState(null);
    const [contributionSubmited, setContributionSubmitted] = useState(false);
    const [contributionKey, setContributionKey] = useState(uuid());

    const isContributionSelected = contributionSelected !== null;
    const data = useData();
    const { troncons = null, contributions = null } = data || {};

    const addContribution = useAddContribution();

    const lines = useMemo(() => {
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

            console.log(
                troncons.length,
                unknownPaths.length +
                    clearedPaths.length +
                    snowyPaths.length +
                    panifiedPaths.length +
                    inProgressPaths.length,
                `Unknown: ${unknownPaths.length} Cleared: ${clearedPaths.length} Snowy: ${snowyPaths.length} Planified: ${panifiedPaths.length} In-progress: ${inProgressPaths.length}`,
            );

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
    }, [troncons]);

    const markers = useMemo(() => {
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
    }, [contributions]);

    const openMenu = useCallback(() => {
        setMenuOpened(true);
    }, [setMenuOpened]);

    const closeMenu = useCallback(() => {
        setMenuOpened(false);
    }, [setMenuOpened]);

    const openAddContribution = useCallback(() => {
        setAddContributionOpened(true);
    }, [setAddContributionOpened]);

    const closeAddContribution = useCallback(() => {
        setAddContributionOpened(false);
    }, [setAddContributionOpened]);

    const mapCenter = useMemo(() => {
        const cookieCenter = Cookie.get('mapCenter') || null;
        return cookieCenter !== null ? JSON.parse(cookieCenter) : [-73.561668, 45.508888];
    }, []);
    const mapZoom = useMemo(() => {
        const cookieZoom = Cookie.get('mapZoom') || null;
        return cookieZoom !== null ? parseFloat(cookieZoom) : 15;
    }, []);

    const storeCenter = useCallback((center) => {
        Cookie.set('mapCenter', JSON.stringify(center), { expires: 3650 });
    }, []);

    const storeZoom = useCallback((zoom) => {
        Cookie.set('mapZoom', zoom, { expires: 3650 });
    }, []);

    const onContributionAdded = useCallback(
        (contribution) => {
            setContributionSubmitted(true);
            closeAddContribution();
            addContribution(contribution);
            setTimeout(() => {
                setContributionSubmitted(false);
                setContributionKey(uuid());
            }, 1000);
        },
        [setContributionSubmitted, closeAddContribution, addContribution],
    );

    const selectContribution = useCallback( (contribution) => {
        setContributionSelected(contribution);
    }, [setContributionSelected]);

    const unselectContribution = useCallback( (contribution) => {
        setContributionSelected(null);
    }, [setContributionSelected]);

    const mapRef = useRef(null);
    const onMapReady = useCallback((map) => {
        mapRef.current = map;
        console.log('ready', map)
    }, []);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.menuOpened]: menuOpened,
                    [styles.contributionSelected]: isContributionSelected,
                    [styles.addContributionOpened]: addContributionOpened,
                    [styles.contributionSubmited]: contributionSubmited,
                },
            ])}
        >
            <MapHeader className={styles.mapHeader} onTogglerClick={openMenu} />
            <Map
                className={styles.map}
                lines={lines}
                markers={markers}
                mapCenter={mapCenter}
                zoom={mapZoom}
                onCenterChanged={storeCenter}
                onZoomChanged={storeZoom}
                onMarkerClick={selectContribution}
                onReady={onMapReady}
            />
            <AddContributionButton
                className={styles.addContributionButton}
                onClick={openAddContribution}
            />
            <HomeMenu className={styles.homeMenu} onClose={closeMenu} />
            <AddContribution
                key={contributionKey}
                className={styles.addContribution}
                onClose={closeAddContribution}
                onContributionAdded={onContributionAdded}
            />
            <div className={styles.contributionDetailsContainer}>
                <ContributionDetails
                    className={styles.contributionDetails}
                    contribution={contributionSelected}
                    onClose={unselectContribution}
                />
            </div>
            <Loading loading={data === null} />
        </div>
    );
}

export default HomePage;
