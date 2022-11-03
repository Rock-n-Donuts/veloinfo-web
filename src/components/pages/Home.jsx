import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import Cookie from 'js-cookie';
import { v1 as uuid } from 'uuid';

import { useTroncons } from '../../contexts/DataContext';
import Map from '../partials/Map';
import MapHeader from '../partials/MapHeader';
import AddContributionButton from '../buttons/AddContribution';
import AddContribution from '../partials/AddContribution';
import HomeMenu from '../partials/HomeMenu';
import Loading from '../partials/Loading';

import styles from '../../styles/pages/home.module.scss';

function HomePage() {
    const [menuOpened, setMenuOpened] = useState(false);
    const [addContributionOpened, setAddContributionOpened] = useState(false);
    const [contributionSubmited, setContributionSubmitted] = useState(false);
    const [contributionKey, setContributionKey] = useState(uuid());
    const troncons = useTroncons();

    const lines = useMemo(() => {
        if (troncons !== null) {
            return [{ coords: troncons.map(({ coords }) => coords) }];
        } else {
            return null;
        }
    }, [troncons]);

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
            setTimeout(() => {
                setContributionSubmitted(false);
                setContributionKey(uuid());
            }, 1000);
        },
        [setContributionSubmitted, closeAddContribution],
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
            <Loading loading={lines === null} />
        </div>
    );
}

export default HomePage;
