import { useCallback, useMemo, useState } from 'react';
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

import contributionImage from '../../assets/images/add-contribution.svg';

import styles from '../../styles/pages/home.module.scss';

function HomePage() {
    const [menuOpened, setMenuOpened] = useState(false);
    const [addContributionOpened, setAddContributionOpened] = useState(false);
    const [contributionSubmited, setContributionSubmitted] = useState(false);
    const [contributionKey, setContributionKey] = useState(uuid());
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
                inProgressPaths.length
            );
            
            return [
                {
                    coords: unknownPaths.map(({ coords }) => coords),
                    color: 'gray'
                },
                {
                    coords: clearedPaths.map(({ coords }) => coords),
                    color: '#4fae77'
                },
                {
                    coords: snowyPaths.map(({ coords }) => coords),
                    color: '#367c98'
                },
                {
                    coords: panifiedPaths.map(({ coords }) => coords),
                    color: '#f09035'
                },
                {
                    coords: inProgressPaths.map(({ coords }) => coords),
                    color: '#8962c7'
                },

            ];
        } else {
            return null;
        }
    }, [troncons]);

    const markers = useMemo(() => {
        if (contributions !== null) {
            return [
                {
                    coords: contributions.map(({ coords }) => coords),
                    src: contributionImage,
                },
            ];
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

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.menuOpened]: menuOpened,
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
                onCenterChanged={storeCenter}
                onZoomChanged={storeZoom}
                mapCenter={mapCenter}
                zoom={mapZoom}
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
            <Loading loading={data === null} />
        </div>
    );
}

export default HomePage;
