import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import Cookie from 'js-cookie';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import {
    useUpdateContribution,
    useContribution,
    useMapData,
    useReady,
    useContributions,
} from '../../contexts/DataContext';
import { useUserCurrentContribution, useUserUpdateContribution } from '../../contexts/SiteContext';
import { isSameLocation } from '../../lib/utils';
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

const propTypes = {
    addContribution: PropTypes.bool,
    report: PropTypes.bool,
    mapLocationZoom: PropTypes.number,
};

const defaultProps = {
    addContribution: false,
    report: false,
    mapLocationZoom: 17,
};

function HomePage({ addContribution, report, mapLocationZoom }) {
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
    const contributions = useContributions();
    const contributionsCoords = useMemo(
        () => (contributions || []).map(({ coords }) => coords),
        [contributions],
    );

    const mapCenter = useMemo(() => {
        const cookieCenter = Cookie.get('mapCenter') || null;
        return cookieCenter !== null ? JSON.parse(cookieCenter) : null;
    }, []);

    const mapZoom = useMemo(() => {
        const cookieZoom = Cookie.get('mapZoom') || null;
        return cookieZoom !== null ? parseFloat(cookieZoom) : null;
    }, []);

    const mainMap = useRef(null);
    const [mainMapCenter, setMainMapCenter] = useState(mapCenter);
    const [mainMapZoom, setMainMapZoom] = useState(mapZoom);

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
            setMainMapCenter(center);
            Cookie.set('mapCenter', JSON.stringify(center), { expires: 3650 });
            if (ready && !confirmed) {
                const foundSame =
                    contributionsCoords.find((coords) => isSameLocation(coords, center)) || null;
                userUpdateContribution({ coords: foundSame !== null ? null : center });
            }
        },
        [ready, userUpdateContribution, confirmed, contributionsCoords],
    );

    const storeZoom = useCallback((zoom) => {
        setMainMapZoom(zoom);
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

    useEffect(() => {
        if (ready) {
            const foundSame =
                contributionsCoords.find((coords) => isSameLocation(coords, mainMapCenter)) || null;
            userUpdateContribution({ coords: foundSame !== null ? null : mainMapCenter });
        }
    }, [ready, contributionsCoords, mainMapCenter, userUpdateContribution]);

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

    const onPhotoLocated = useCallback(
        (coords) => {
            setMainMapCenter(coords);
            if (mainMap.current.getView().getZoom() < mapLocationZoom) {
                setMainMapZoom(mapLocationZoom);
            }
        },
        [mapLocationZoom],
    );

    const loading = !ready;

    const onMapReady = useCallback(({ map }) => {
        mainMap.current = map;
    }, []);

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
                    [styles.mapMarkerDropped]: addContribution && hasType,
                    [styles.loading]: loading,
                },
            ])}
        >
            <Meta
                title={intl.formatMessage({ id: 'app-title' })}
                description={intl.formatMessage({ id: 'app-description' })}
                image="/share-image.jpg"
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
                    zoom={mainMapZoom}
                    followUserZoom={mapLocationZoom}
                    onMoveEnded={onMapMoved}
                    onMarkerClick={selectContribution}
                    onReady={onMapReady}
                />
                <div className={styles.mapMarkerContainer}>
                    <PhotoUploadMarker
                        className={styles.mapMarker}
                        onPhotoLocated={onPhotoLocated}
                    />
                </div>
            </div>
            <AddContributionButton
                className={styles.addContributionButton}
                opened={addContribution}
                onOpen={onInitAddContribution}
                onClose={onCancelAddContribution}
                onSend={openAddContribution}
            />
            <ReportLinksButton
                className={styles.reportLinksButton}
                opened={report}
                onOpen={openReportLinks}
                onClose={closeReportLinks}
            />
            <HomeMenu className={styles.homeMenu} onClose={closeMenu} />
            <AddContributionConfirmation
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

HomePage.propTypes = propTypes;
HomePage.defaultProps = defaultProps;

export default HomePage;
