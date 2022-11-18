import { useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import Cookie from 'js-cookie';
import { v1 as uuid } from 'uuid';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import {
    useUpdateContribution,
    useContribution,
    useMapData,
    useReady,
} from '../../contexts/DataContext';
import Map from '../partials/Map';
import MapHeader from '../partials/MapHeader';
import AddContribution from '../partials/AddContribution';
import HomeMenu from '../partials/HomeMenu';
import Loading from '../partials/Loading';
import ContributionDetails from '../partials/ContributionDetails';
import AddContributionButton from '../buttons/AddContribution';

import styles from '../../styles/pages/home.module.scss';

function HomePage() {
    const [menuOpened, setMenuOpened] = useState(false);
    const [addContributionOpened, setAddContributionOpened] = useState(false);
    const [selectedContributionId, setSelectedContributionId] = useState(null);
    const [contributionSubmited, setContributionSubmitted] = useState(false);
    const [contributionKey, setContributionKey] = useState(uuid());

    const isContributionSelected = selectedContributionId !== null;
    const ready = useReady();
    const contributionSelected = useContribution(selectedContributionId);
    const { lines, markers } = useMapData();

    const updateContribution = useUpdateContribution();

    // const openMenu = useCallback(() => {
    //     setMenuOpened(true);
    // }, [setMenuOpened]);

    const closeMenu = useCallback(() => {
        setMenuOpened(false);
    }, [setMenuOpened]);

    const toggleMenu = useCallback(() => {
        setMenuOpened((old) => !old);
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
            updateContribution(contribution);
            setTimeout(() => {
                setContributionSubmitted(false);
                setContributionKey(uuid());
            }, 1000);
        },
        [setContributionSubmitted, closeAddContribution, updateContribution],
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

    const transitionNodeRef = useRef(null);
    const [contributionDetailsActive, setContributionDetailsActive] = useState(false);

    const onContributionDetailsSafeClick = useCallback(() => {
        if (contributionDetailsActive) {
            unselectContribution();
        }
    }, [contributionDetailsActive, unselectContribution]);

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
            <MapHeader className={styles.mapHeader} onTogglerClick={toggleMenu} />
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
                <div className={styles.contributionDetails}>
                    <button
                        type="button"
                        className={styles.contributionDetailsSafe}
                        onClick={onContributionDetailsSafeClick}
                    />
                    <TransitionGroup className={styles.contributionDetailsGroup}>
                        {contributionSelected !== null ? (
                            <CSSTransition
                                nodeRef={transitionNodeRef}
                                key={contributionSelected.id}
                                timeout={250}
                                onEntered={() => {
                                    setContributionDetailsActive(true);
                                }}
                                onExit={() => {
                                    setContributionDetailsActive(false);
                                }}
                            >
                                <div
                                    className={styles.contributionDetailsInner}
                                    ref={transitionNodeRef}
                                >
                                    <ContributionDetails
                                        contribution={contributionSelected}
                                        onClose={unselectContribution}
                                    />
                                </div>
                            </CSSTransition>
                        ) : null}
                    </TransitionGroup>
                </div>
            </div>
            <Loading loading={!ready} />
        </div>
    );
}

export default HomePage;
