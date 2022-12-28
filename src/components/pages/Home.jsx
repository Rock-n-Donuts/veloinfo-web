import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import Cookie from 'js-cookie';
import { v1 as uuid } from 'uuid';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import DeviceDetector from 'device-detector-js';

import {
    useUpdateContribution,
    useContribution,
    useMapData,
    useReady,
} from '../../contexts/DataContext';
import { useUserCurrentContribution, useUserUpdateContribution } from '../../contexts/SiteContext';
import Map from '../map/Map';
import Meta from '../partials/Meta';
import HomeMenu from '../partials/HomeMenu';
import Loading from '../partials/Loading';
import AddContributionConfirmation from '../partials/AddContributionConfirmation';
import ContributionDetails from '../partials/ContributionDetails';
import PhotoUploadMarker from '../partials/PhotoUploadMarker';
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
    const { confirmed = false, type = null } = userCurrentContribution || {};
    const hasType = type !== null;
    const confirmationOpened = addContribution && confirmed;

    const isContributionSelected = selectedContributionId !== null;
    const ready = useReady();
    const contributionSelected = useContribution(selectedContributionId);
    const { lines, markers } = useMapData();

    const mapCenter = useMemo(() => {
        const cookieCenter = Cookie.get('mapCenter') || null;
        return cookieCenter !== null ? JSON.parse(cookieCenter) : null;
    }, []);
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
            Cookie.set('mapCenter', JSON.stringify(center), { expires: 3650 });
            userUpdateContribution({ coords: center });
        },
        [userUpdateContribution],
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

    const geolocate = useMemo(() => {
        const deviceDetector = new DeviceDetector();
        const result = deviceDetector.parse(navigator.userAgent);
        const { device } = result || {};
        const { type } = device || {};
        return type !== 'desktop';
    }, []);

    const [geolocating, setGeolocating] = useState(false);
    const onContributionTypeSelected = useCallback(() => {
        if (geolocate && navigator.geolocation) {
            setGeolocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { coords } = position || {};
                    const { latitude, longitude } = coords || {};
                    setMainMapCenter([longitude, latitude]);
                    setGeolocating(false);
                },
                () => {
                    setGeolocating(false);
                },
            );
        }
    }, [geolocate]);

    const loading = !ready || geolocating;

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.menuOpened]: menuOpened,
                    [styles.reportLinksOpened]: report,
                    [styles.addContribution]: addContribution,
                    [styles.confirmationOpened]: confirmationOpened,
                    [styles.contributionSubmited]: contributionSubmited,
                    [styles.contributionSelected]: isContributionSelected,
                    [styles.mapMarkerDropped]: addContribution && hasType && !geolocating,
                    [styles.loading]: loading,
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
                <div className={styles.mapMarkerContainer}>
                    <PhotoUploadMarker className={styles.mapMarker} />
                </div>
            </div>
            <AddContributionButton
                className={styles.addContributionButton}
                opened={addContribution}
                loading={geolocating}
                onOpen={onInitAddContribution}
                onClose={onCancelAddContribution}
                onSend={openAddContribution}
                onSelect={onContributionTypeSelected}
            />
            <ReportLinksButton
                className={styles.reportLinksButton}
                opened={report}
                onOpen={openReportLinks}
                onClose={closeReportLinks}
            />
            <HomeMenu className={styles.homeMenu} onClose={closeMenu} />
            <AddContributionConfirmation
                key={contributionKey}
                className={styles.addContribution}
                confirmed={confirmationOpened}
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
            <Loading loading={loading} />
        </div>
    );
}

export default HomePage;
