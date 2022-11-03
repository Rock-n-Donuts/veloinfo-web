import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import Cookie from 'js-cookie';

import Map from '../partials/Map';
import MapHeader from '../partials/MapHeader';
import AddContributionButton from '../buttons/AddContribution';
import AddContribution from '../partials/AddContribution';
import HomeMenu from '../partials/HomeMenu';

import styles from '../../styles/pages/home.module.scss';
import { useTroncons } from '../../contexts/DataContext';

function HomePage() {
    const [menuOpened, setMenuOpened] = useState(false);
    const [addContributionOpened, setAddContributionOpened] = useState(false);
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

    const mapCenter = useMemo( () => {
        const cookieCenter = Cookie.get('mapCenter') || null;
        return cookieCenter !== null ? JSON.parse(cookieCenter) : [-73.561668, 45.508888]        
    }, []);
    const mapZoom = useMemo( () => {
        const cookieZoom = Cookie.get('mapZoom') || null;
        return cookieZoom !== null ? parseFloat(cookieZoom) : 15;
    }, []);

    const storeCenter = useCallback((center) => {
        Cookie.set('mapCenter', JSON.stringify(center), { expires: 3650 });
    }, []);

    const storeZoom = useCallback((zoom) => {
        Cookie.set('mapZoom', zoom, { expires: 3650 });
    }, []);

    return (
        <div className={classNames([styles.container])}>
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
            <HomeMenu className={styles.homeMenu} opened={menuOpened} onClose={closeMenu} />
            <AddContribution
                className={styles.addContribution}
                opened={addContributionOpened}
                onClose={closeAddContribution}
            />
        </div>
    );
}

export default HomePage;
