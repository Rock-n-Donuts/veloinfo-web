import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
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
import Meta from '../partials/Meta';
import Map from '../partials/Map';
import HomeMenu from '../partials/HomeMenu';
import Loading from '../partials/Loading';
import AddContributionModal from '../partials/AddContributionModal';
import ContributionDetails from '../partials/ContributionDetails';
import ContributionCoordsSelector from '../partials/ContributionCoordsSelector';
import AddContributionButton from '../buttons/AddContribution';
import ReportLinksButton from '../buttons/ReportLinks';
import MenuButton from '../buttons/Menu';
import TimeFilter from '../filters/TimeFilter';
import LayersFilter from '../filters/LayersFilter';

import styles from '../../styles/pages/home.module.scss';

function HomePage({ addContribution = false, report = false }) {
    const intl = useIntl();
    const { id: selectedContributionId = null } = useParams();
    const initialSelectedContributionId = useRef(selectedContributionId);

    const navigate = useNavigate();
    const [menuOpened, setMenuOpened] = useState(false);
    const [timeFilterOpened, setTimeFilterOpened] = useState(false);
    const [layersFilterOpened, setLayersFilterOpened] = useState(false);

    const transitionNodeRef = useRef(null);
    const [contributionDetailsActive, setContributionDetailsActive] = useState(false);

    const [contributionSubmited, setContributionSubmitted] = useState(false);
    const [contributionKey, setContributionKey] = useState(uuid());
    const updateContribution = useUpdateContribution();

    const userCurrentContribution = useUserCurrentContribution();
    const userUpdateContribution = useUserUpdateContribution();
    const { confirmed = false } = userCurrentContribution || {};
    const formOpened = addContribution && confirmed;

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
        userUpdateContribution({ confirmed: true });
    }, [userUpdateContribution]);

    const closeAddContribution = useCallback(() => {
        userUpdateContribution({ confirmed: false });
    }, [userUpdateContribution]);

    const goHome = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const openTimeFilter = useCallback(() => {
        setTimeFilterOpened(true);
    }, []);

    const closeTimeFilter = useCallback(() => {
        setTimeFilterOpened(false);
    }, []);

    const openLayersFilter = useCallback(() => {
        setLayersFilterOpened(true);
    }, []);

    const closeLayersFilter = useCallback(() => {
        setLayersFilterOpened(false);
    }, []);

    const storeCenter = useCallback(
        (center) => {
            lastMapCenter.current = center;
            Cookie.set('mapCenter', JSON.stringify(center), { expires: 3650 });
            if (addContribution) {
                userUpdateContribution({ coords: center });
            }
        },
        [addContribution, userUpdateContribution],
    );

    const storeZoom = useCallback((zoom) => {
        Cookie.set('mapZoom', zoom, { expires: 3650 });
    }, []);

    const onMapMoved = useCallback(
        ({ zoom, center }) => {
            storeCenter(center);
            storeZoom(zoom);
        },
        [storeCenter, storeZoom],
    );

    useEffect(() => {
        if (!formOpened) {
            setMainMapCenter(lastMapCenter.current);
        }
    }, [formOpened]);

    useEffect(() => {
        if (addContribution) {
            userUpdateContribution({ coords: lastMapCenter.current });
        }
    }, [addContribution, userUpdateContribution]);

    const onMinimapMoved = useCallback(
        ({ center }) => {
            storeCenter(center);
        },
        [storeCenter],
    );

    const onContributionAdded = useCallback(
        (contribution) => {
            setContributionSubmitted(true);
            updateContribution(contribution);
            goHome();

            setTimeout(() => {
                setContributionSubmitted(false);
                setContributionKey(uuid());
            }, 1000);
        },
        [setContributionSubmitted, updateContribution, goHome],
    );

    const selectContribution = useCallback(
        ({ id }) => {
            navigate(`/contribution/${id}`);
        },
        [navigate],
    );

    const unselectContribution = useCallback(() => {
        goHome();
    }, [goHome]);

    const onContributionDetailsSafeClick = useCallback(() => {
        if (contributionDetailsActive || contributionSelected === null) {
            unselectContribution();
        }
    }, [contributionDetailsActive, unselectContribution, contributionSelected]);

    const initialSelectedContribution = useMemo(
        () =>
            contributionSelected !== null &&
            `${contributionSelected.id}` === `${initialSelectedContributionId.current}`
                ? contributionSelected
                : null,
        [contributionSelected],
    );
    useEffect(() => {
        if (initialSelectedContribution !== null) {
            const { coords = null } = initialSelectedContribution || {};
            if (coords !== null) {
                setMainMapCenter(coords);
            }
        }
    }, [initialSelectedContribution]);

    useEffect(() => {
        if (addContribution || report || contributionSelected !== null) {
            setMenuOpened(false);
            setTimeFilterOpened(false);
            setLayersFilterOpened(false);
        }
    }, [contributionSelected, addContribution, report]);

    const openReportLinks = useCallback(() => {
        navigate('/signaler');
    }, [navigate]);
    const closeReportLinks = useCallback(() => {
        goHome();
    }, [goHome]);

    const onInitAddContribution = useCallback(() => {
        navigate('/ajouter');
    }, [navigate]);
    const onCancelAddContribution = useCallback(() => {
        goHome();
    }, [goHome]);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.menuOpened]: menuOpened,
                    [styles.reportLinksOpened]: report,
                    [styles.addContribution]: addContribution,
                    [styles.formOpened]: formOpened,
                    [styles.contributionSubmited]: contributionSubmited,
                    [styles.contributionSelected]: isContributionSelected,
                },
            ])}
        >
            <Meta
                title={intl.formatMessage({ id: 'app-title' })}
                description={intl.formatMessage({ id: 'app-description' })}
                image="/og-image.jpg"
            />
            <div className={styles.mapHeader}>
                <div className={styles.left}>
                    <MenuButton className={styles.menuButton} onClick={toggleMenu} />
                </div>
                <div className={styles.center}>
                    <TimeFilter
                        className={styles.timeFilter}
                        opened={timeFilterOpened}
                        onOpen={openTimeFilter}
                        onClose={closeTimeFilter}
                    />
                </div>
                <div className={styles.right}>
                    <LayersFilter
                        className={styles.layersFilter}
                        opened={layersFilterOpened}
                        onOpen={openLayersFilter}
                        onClose={closeLayersFilter}
                    />
                </div>
            </div>
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
                <ContributionCoordsSelector
                    className={styles.contributionCoordsSelector}
                    opened={addContribution}
                />
            </div>
            <AddContributionButton
                className={styles.addContributionButton}
                opened={addContribution}
                onOpen={onInitAddContribution}
                onClose={onCancelAddContribution}
                onNext={openAddContribution}
            />
            <ReportLinksButton
                className={styles.reportLinksButton}
                opened={report}
                onOpen={openReportLinks}
                onClose={closeReportLinks}
            />
            <HomeMenu className={styles.homeMenu} onClose={closeMenu} />
            <AddContributionModal
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
