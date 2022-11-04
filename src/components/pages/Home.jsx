import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import Cookie from 'js-cookie';
import { v1 as uuid } from 'uuid';

import { useAddContribution, useData, useLines, useMarkers } from '../../contexts/DataContext';
import Map from '../partials/Map';
import MapHeader from '../partials/MapHeader';
import AddContributionButton from '../buttons/AddContribution';
import AddContribution from '../partials/AddContribution';
import HomeMenu from '../partials/HomeMenu';
import Loading from '../partials/Loading';
import ContributionDetails from '../partials/ContributionDetails';

import styles from '../../styles/pages/home.module.scss';

function HomePage() {
    const [menuOpened, setMenuOpened] = useState(false);
    const [addContributionOpened, setAddContributionOpened] = useState(false);
    const [selectedContributionId, setSelectedContributionId] = useState(null);
    const [contributionSubmited, setContributionSubmitted] = useState(false);
    const [contributionKey, setContributionKey] = useState(uuid());

    const isContributionSelected = selectedContributionId !== null;
    const data = useData();
    const lines = useLines();
    const markers = useMarkers();
    const { contributions = null } = data || {};
    const contributionSelected =
        contributions !== null
            ? contributions.find(({ id }) => parseInt(id) === selectedContributionId) || null
            : null;

    const addContribution = useAddContribution();    

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

    const selectContribution = useCallback(
        ({ id }) => {
            setSelectedContributionId(id);
        },
        [setSelectedContributionId],
    );

    const unselectContribution = useCallback(() => {
        setSelectedContributionId(null);
    }, [setSelectedContributionId]);

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
