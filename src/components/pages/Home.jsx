import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useUserCurrentContribution, useUserUpdateContribution } from '../../contexts/SiteContext';
import Map from '../partials/Map';
import MapHeader from '../partials/MapHeader';
import AddContribution from '../partials/AddContribution';
import HomeMenu from '../partials/HomeMenu';
import Loading from '../partials/Loading';
import ContributionDetails from '../partials/ContributionDetails';
import ContributionCoordsSelector from '../partials/ContributionCoordsSelector';
import AddContributionButton from '../buttons/AddContribution';

import styles from '../../styles/pages/home.module.scss';

function HomePage() {
    const [menuOpened, setMenuOpened] = useState(false);
    const [addContributionOpened, setAddContributionOpened] = useState(false);
    const [selectedContributionId, setSelectedContributionId] = useState(null);
    const [contributionSubmited, setContributionSubmitted] = useState(false);
    const [contributionKey, setContributionKey] = useState(uuid());

    const userCurrentContribution = useUserCurrentContribution();
    const hasUserCurrentContribution = userCurrentContribution !== null;

    const isContributionSelected = selectedContributionId !== null;
    const ready = useReady();
    const contributionSelected = useContribution(selectedContributionId);
    const { lines, markers } = useMapData();

    const mapCenter = useMemo(() => {
        const cookieCenter = Cookie.get('mapCenter') || null;
        return cookieCenter !== null ? JSON.parse(cookieCenter) : null;
    }, []);
    const lastMapCenter = useRef(mapCenter);
    const [mainMapCenter, setMainMapCenter] = useState(mapCenter);
    
    const mapZoom = useMemo(() => {
        const cookieZoom = Cookie.get('mapZoom') || null;
        return cookieZoom !== null ? parseFloat(cookieZoom) : null;
    }, []);

    const updateContribution = useUpdateContribution();
    const userUpdateContribution = useUserUpdateContribution();

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
        setMainMapCenter(lastMapCenter.current);
        setAddContributionOpened(false);
    }, [setAddContributionOpened]);

    const storeCenter = useCallback(
        (center) => {
            lastMapCenter.current = center;
            Cookie.set('mapCenter', JSON.stringify(center), { expires: 3650 });
            if (hasUserCurrentContribution) {
                userUpdateContribution({ coords: center });
            }
        },
        [hasUserCurrentContribution, userUpdateContribution],
    );

    useEffect( () => {
        if (hasUserCurrentContribution) {
            userUpdateContribution({ coords: lastMapCenter.current });
        }
    }, [hasUserCurrentContribution, userUpdateContribution]);

    const storeZoom = useCallback((zoom) => {
        Cookie.set('mapZoom', zoom, { expires: 3650 });
    }, []);

    const onMapMoved = useCallback(({ zoom, center }) => {
        storeCenter(center);
        storeZoom(zoom);
    }, [storeCenter, storeZoom]);

    const onMinimapMoved = useCallback(({ center }) => {
        storeCenter(center);
    }, [storeCenter]);

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
            <div className={styles.mapContainer}>
                <Map
                    className={styles.map}
                    lines={lines}
                    markers={markers}
                    mapCenter={mainMapCenter}
                    zoom={mapZoom}
                    onMoveEnded={onMapMoved}
                    onMarkerClick={selectContribution}
                />
                <ContributionCoordsSelector className={styles.contributionCoordsSelector} />
            </div>
            <AddContributionButton
                className={styles.addContributionButton}
                onNext={openAddContribution}
            />
            <HomeMenu className={styles.homeMenu} onClose={closeMenu} />
            <AddContribution
                key={contributionKey}
                className={styles.addContribution}
                onClose={closeAddContribution}
                onMinimapMoved={onMinimapMoved}
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
