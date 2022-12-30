import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { fromLonLat, transform } from 'ol/proj';
import { Point, LineString } from 'ol/geom';
import { VectorImage, Tile as TileLayer, Vector as LayerVector } from 'ol/layer';
import { Cluster, Vector as VectorSource, XYZ, OSM } from 'ol/source';
import { Style, Stroke, Icon, Fill, Text, Circle } from 'ol/style';
import { boundingExtent } from 'ol/extent';
import View from 'ol/View';
import { default as OlMap } from 'ol/Map';
import Feature from 'ol/Feature';
import { defaults as defaultInteractions } from 'ol/interaction/defaults';
import { asArray } from 'ol/color';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocation } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

import { getColoredIcons } from '../../lib/map';
import MapMarker from './MapMarker';
import { isDeviceMobile } from '../../lib/utils';

import styles from '../../styles/map/map.module.scss';
import Loading from '../partials/Loading';

const isDev = process.env.NODE_ENV !== 'production';
const jawgId = process.env.REACT_APP_JAWG_ID;
const jawgToken = process.env.REACT_APP_JAWG_TOKEN;

const propTypes = {
    className: PropTypes.string,
    disableInteractions: PropTypes.bool,
    mapCenter: PropTypes.arrayOf(PropTypes.number),
    defaultMapCenter: PropTypes.arrayOf(PropTypes.number),
    zoom: PropTypes.number,
    defaultZoom: PropTypes.number,
    followUserZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    lines: PropTypes.arrayOf(
        PropTypes.shape({
            color: PropTypes.string,
            width: PropTypes.number,
            coords: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
            onClick: PropTypes.func,
        }),
    ),
    markers: PropTypes.arrayOf(
        PropTypes.shape({
            src: PropTypes.string,
            coords: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
            onClick: PropTypes.func,
        }),
    ),
    clusterDistance: PropTypes.number,
    clusterMinDistance: PropTypes.number,
    onMoveEnded: PropTypes.func,
    onCenterChanged: PropTypes.func,
    onZoomChanged: PropTypes.func,
    onMarkerClick: PropTypes.func,
    onLineClick: PropTypes.func,
    onReady: PropTypes.func,
};

const defaultProps = {
    className: null,
    disableInteractions: false,
    mapCenter: null,
    defaultMapCenter: [-73.561668, 45.508888],
    zoom: null,
    defaultZoom: 15,
    followUserZoom: 17,
    maxZoom: 20,
    lines: null,
    markers: null,
    clusterDistance: 25,
    clusterMinDistance: 20,
    onMoveEnded: null,
    onCenterChanged: null,
    onZoomChanged: null,
    onMarkerClick: null,
    onLineClick: null,
    onReady: null,
};

function Map({
    className,
    disableInteractions,
    mapCenter,
    defaultMapCenter,
    zoom,
    defaultZoom,
    followUserZoom,
    maxZoom,
    lines,
    markers,
    clusterDistance,
    clusterMinDistance,
    onMoveEnded,
    onCenterChanged,
    onZoomChanged,
    onMarkerClick,
    onLineClick,
    onReady,
}) {
    const isMobile = useMemo(() => isDeviceMobile(), []);
    const [isHover, setIsHover] = useState(false);
    const [ready, setReady] = useState(false);
    const [loadingUserPosition, setLoadingUserPosition] = useState(false);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [acceptedLocation, setAcceptedLocation] = useState(
        Cookies.get('locationAccepted') === 'true',
    );

    const [iconsLoaded, setIconLoaded] = useState(
        getColoredIcons().map(({ icon, color }) => ({ key: `${icon}${color}`, loaded: false })),
    );
    const allIconsLoaded = useMemo(
        () => iconsLoaded.filter(({ loaded }) => !loaded).length === 0,
        [iconsLoaded],
    );

    const markerIconsRef = useRef([]);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const storedLines = useRef([]);
    const markerLayers = useRef([]);

    const onMarkerIconLoaded = useCallback((icon) => {
        setIconLoaded((old) =>
            old.map(({ key, loaded }) => ({ key, loaded: key === icon ? true : loaded })),
        );
    }, []);

    const getMapCenter = useCallback(
        () => transform(mapRef.current.getView().getCenter(), 'EPSG:3857', 'EPSG:4326'),
        [],
    );

    const setMapCenter = useCallback((center) => {
        mapRef.current.getView().setCenter(transform(center, 'EPSG:4326', 'EPSG:3857'));
    }, []);

    const getMapZoom = useCallback(() => mapRef.current.getView().getZoom(), []);
    const setMapZoom = useCallback((z) => mapRef.current.getView().setZoom(z), []);

    const isSameLocation = useCallback((location1, location2) => {
        const diffLon = Math.abs(location1[0] - location2[0]);
        const diffLat = Math.abs(location1[1] - location2[1]);
        return diffLon + diffLat < 0.0001;
    }, []);

    const onChangeCenter = useCallback(() => {
        if (isFollowingUser && userLocation !== null) {
            const { coords } = userLocation || {};
            const { latitude, longitude } = coords || {};
            if (!isSameLocation(getMapCenter(), [longitude, latitude])) {
                setIsFollowingUser(false);
            }
        }
        if (onCenterChanged !== null) {
            onCenterChanged(getMapCenter());
        }
    }, [onCenterChanged, getMapCenter, isFollowingUser, userLocation, isSameLocation]);

    const onChangeZoom = useCallback(() => {
        if (onZoomChanged !== null) {
            onZoomChanged(mapRef.current.getView().getZoom());
        }
    }, [onZoomChanged]);

    const onMoveEnd = useCallback(() => {
        if (onMoveEnded !== null) {
            onMoveEnded({
                center: getMapCenter(),
                zoom: getMapZoom(),
            });
        }
    }, [onMoveEnded, getMapZoom, getMapCenter]);

    const onMapPointerMove = useCallback(
        (e) => {
            const pixel = mapRef.current.getEventPixel(e.originalEvent);
            const feature =
                mapRef.current.forEachFeatureAtPixel(pixel, function (feature) {
                    return feature;
                }) || null;
            if (feature !== null) {
                const propreties = feature.getProperties();
                const { features = null } = propreties;
                const currentFeature = features !== null ? features[0] : feature;
                const attributes = currentFeature.get('attributes');
                const { clickable = false } = attributes || {};

                if (clickable) {
                    setIsHover(true);
                } else {
                    setIsHover(false);
                }
            } else {
                setIsHover(false);
            }
        },
        [setIsHover],
    );

    const onMapClick = useCallback(
        (e) => {
            const pixel = mapRef.current.getEventPixel(e.originalEvent);
            const clickedFeature =
                mapRef.current.forEachFeatureAtPixel(pixel, function (feature) {
                    return feature;
                }) || null;
            if (clickedFeature !== null) {
                const clickedFeaturePropreties = clickedFeature.getProperties();
                const { geometry: clickedGeometry, features: clickedFeatures } =
                    clickedFeaturePropreties;
                const type = clickedGeometry.getType();

                if (type === 'Point') {
                    if (clickedFeatures.length) {
                        if (clickedFeatures.length > 1) {
                            const extent = boundingExtent(
                                clickedFeatures.map((r) => r.getGeometry().getCoordinates()),
                            );
                            mapRef.current.getView().fit(extent, {
                                maxZoom: 22,
                                duration: 750,
                                padding: [100, 100, 100, 100],
                            });
                        } else {
                            const feature = clickedFeatures[0];
                            const featureAttributes = feature.get('attributes');
                            if (onMarkerClick !== null && featureAttributes.clickable) {
                                onMarkerClick(featureAttributes);
                            }
                        }
                    }
                }

                if (type === 'LineString') {
                    const attributes = clickedFeature.get('attributes');
                    if (onLineClick !== null && attributes.clickable) {
                        onLineClick(attributes);
                    }
                }
            }
        },
        [onMarkerClick, onLineClick],
    );

    const currentPositionLayer = useRef(null);
    const currentPositionLayerBg = useRef(null);
    const currentPositionFeature = useRef(null);
    const currentPositionFeatureBg = useRef(null);

    const initMap = useCallback(
        (target) => {
            const view = new View({
                enableRotation: false,
                center: fromLonLat(mapCenter || defaultMapCenter),
                zoom: zoom !== null ? zoom : defaultZoom,
                maxZoom,
            });

            const rgba = [...asArray('#367c99')];
            rgba[3] = 0.25;
            const iconStyleBg = new Style({
                image: new Circle({
                    radius: 40,
                    fill: new Fill({ color: rgba }),
                }),
            });

            const iconStyle = new Style({
                image: new Circle({
                    radius: 10,
                    fill: new Fill({ color: '#367c99' }),
                    stroke: new Stroke({
                        color: '#fff',
                        width: 3,
                    }),
                }),
            });
            currentPositionFeature.current = new Feature();
            currentPositionFeatureBg.current = new Feature();

            const iconSourceBg = new VectorSource({
                features: [currentPositionFeatureBg.current],
            });

            const iconSource = new VectorSource({
                features: [currentPositionFeature.current],
            });
            currentPositionLayerBg.current = new LayerVector({
                source: iconSourceBg,
                style: iconStyleBg,
            });
            currentPositionLayer.current = new LayerVector({
                source: iconSource,
                style: iconStyle,
            });

            mapRef.current = new OlMap({
                interactions: disableInteractions ? [] : defaultInteractions(),
                target,
                view,
                layers: [
                    new TileLayer({
                        source: isDev
                            ? new OSM()
                            : new XYZ({
                                //   url: `https://tile.jawg.io/${jawgId}/{z}/{x}/{y}.png?access-token=${jawgToken}`,
                                  url: 'https://{a-c}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
                              }),
                    }),
                    currentPositionLayerBg.current,
                    currentPositionLayer.current,
                ],
            });
            setReady(true);
            return mapRef.current;
        },
        [defaultMapCenter, mapCenter, zoom, defaultZoom, maxZoom, disableInteractions],
    );

    const drawLines = useCallback((linesGroup) => {
        function addFeature(params) {
            const { coords, data = null, clickable = false } = params;
            const { visible = false } = data || {};
            const points = coords.map((coord) => transform(coord, 'EPSG:4326', 'EPSG:3857'));
            const feature = new Feature({
                geometry: new LineString(points),
                attributes: { ...data, clickable },
            });

            feature.setStyle(visible ? undefined : new Style({}));
            return feature;
        }

        const layers = mapRef.current.getLayers();
        const layersLength = layers.getLength();

        linesGroup.forEach((lines, groupIndex) => {
            const cacheGroup = storedLines.current[groupIndex] || null;
            if (cacheGroup !== null) {
                const { features: groupFeatures, source } = cacheGroup;
                const { features } = lines;
                features.forEach((object) => {
                    const { data } = object;
                    const { id } = data;
                    const existingFeature =
                        groupFeatures.find(({ id: featureId }) => id === featureId) || null;
                    if (existingFeature === null) {
                        const feature = addFeature(object);
                        source.addFeature(feature);
                        groupFeatures.push({ feature, id });
                    } else {
                        const { visible = false } = data || {};
                        const { feature } = existingFeature;
                        feature.setStyle(visible ? undefined : new Style({}));
                    }
                });
            } else {
                const vectorSource = new VectorSource();

                const { features: linesFeatures, color = '#0000FF', width = 3.5 } = lines || {};
                const rgba = [...asArray(color)];
                rgba[3] = 0.9;
                const layer = new VectorImage({
                    source: vectorSource,
                    style: new Style({
                        stroke: new Stroke({ color: rgba, width }),
                    }),
                });

                layers.insertAt(layersLength - 1, layer);
                storedLines.current[groupIndex] = {
                    layer,
                    source: vectorSource,
                    features: linesFeatures.map((object) => {
                        const { data } = object;
                        const { id } = data;
                        const feature = addFeature(object);
                        vectorSource.addFeature(feature);
                        return { feature, id };
                    }),
                };
            }
        });
    }, []);

    const addMarkers = useCallback(
        (markerGroups) => {
            function addFeature(params) {
                const { coords, data = null, clickable = false } = params;
                const feature = new Feature({
                    geometry: new Point(fromLonLat(coords)),
                    attributes: { ...data, clickable },
                });
                return feature;
            }

            markerLayers.current.forEach((layer) => {
                mapRef.current.removeLayer(layer);
            });
            markerLayers.current = [];

            const layers = mapRef.current.getLayers();
            const layersLength = layers.getLength();

            markerGroups.forEach((markers, groupIndex) => {
                const {
                    features: markersFeatures,
                    src,
                    icon,
                    scale,
                    withoutCluster = false,
                    color,
                } = markers || {};

                const vectorSource = new VectorSource();

                const clusterSource = new Cluster({
                    distance: clusterDistance,
                    minDistance: clusterMinDistance,
                    source: vectorSource,
                });

                const visibleFeatures = markersFeatures.filter(
                    ({ data: { visible = false } }) => visible,
                );

                const styleCache = {};
                const layer = new VectorImage({
                    source: withoutCluster ? vectorSource : clusterSource,
                    style: function (feature) {
                        const features = feature.get('features');
                        const { length = 0 } = features || [];
                        let style = styleCache[length];
                        if (!style) {
                            const img =
                                src === undefined
                                    ? markerIconsRef.current[`${icon}${color}`]
                                    : undefined;
                            style = new Style({
                                image: new Icon({
                                    anchor: [0.5, 1],
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'fraction',
                                    src,
                                    img,
                                    imgSize: !src && img ? [img.width, img.height] : undefined,
                                    scale: scale,
                                }),
                                text:
                                    length > 1
                                        ? new Text({
                                              text: length.toString(),
                                              offsetX: 6,
                                              offsetY: -3,
                                              scale: scale * 2,
                                              font: '12px Arial',
                                              fill: new Fill({
                                                  color: '#FFF',
                                              }),
                                              stroke: new Stroke({
                                                  color,
                                                  width: 5,
                                              }),
                                          })
                                        : undefined,
                            });
                            styleCache[length] = style;
                        }
                        return style;
                    },
                });

                visibleFeatures.forEach((object) => {
                    vectorSource.addFeature(addFeature(object));
                });

                layers.insertAt(layersLength - 1, layer);
                markerLayers.current.push(layer);
            });
        },
        [clusterDistance, clusterMinDistance],
    );

    useEffect(() => {
        const { current: mapContainer = null } = mapContainerRef;

        if (allIconsLoaded && mapContainer && mapRef.current === null) {
            initMap(mapContainer);
        }

        if (mapRef.current !== null) {
            mapRef.current.getView().on('change:center', onChangeCenter);
            mapRef.current.getView().on('change:resolution', onChangeZoom);
            mapRef.current.on('moveend', onMoveEnd);
            mapRef.current.on('click', onMapClick);
            // mapRef.current.on('pointermove', onMapPointerMove);
        }

        return () => {
            if (mapRef.current !== null) {
                mapRef.current.getView().un('change:center', onChangeCenter);
                mapRef.current.getView().un('change:resolution', onChangeZoom);
                mapRef.current.un('moveend', onMoveEnd);
                mapRef.current.un('click', onMapClick);
                // mapRef.current.un('pointermove', onMapPointerMove);
            }
        };
    }, [
        allIconsLoaded,
        initMap,
        onMapClick,
        onMapPointerMove,
        onChangeCenter,
        onChangeZoom,
        onMoveEnd,
    ]);

    useEffect(() => {
        if (mapRef.current !== null && mapCenter !== null) {
            const lastCenter = transform(
                mapRef.current.getView().getCenter(),
                'EPSG:3857',
                'EPSG:4326',
            );
            if (mapCenter[0] !== lastCenter[0] && mapCenter[1] !== lastCenter[1]) {
                setMapCenter(mapCenter);
            }
        }
    }, [mapCenter, setMapCenter]);

    useEffect(() => {
        if (mapRef.current !== null && zoom !== null) {
            if (zoom !== getMapZoom()) {
                setMapZoom(zoom);
            }
        }
    }, [zoom, getMapZoom, setMapZoom]);

    useEffect(() => {
        if (ready && lines !== null) {
            drawLines(lines);
        }
    }, [ready, lines, drawLines]);

    useEffect(() => {
        if (ready && markers !== null) {
            addMarkers(markers);
        }
    }, [ready, markers, addMarkers]);

    useEffect(() => {
        if (ready) {
            if (onReady !== null) {
                onReady({ map: mapRef.current, mapCenter: getMapCenter(), zoom: getMapZoom() });
            }
        }
    }, [ready, onReady, getMapCenter, getMapZoom]);

    const markerIcons = useMemo(() => getColoredIcons(), []);

    useEffect(() => {
        if (currentPositionFeatureBg.current !== null && currentPositionFeature.current !== null) {
            if (userLocation !== null) {
                const { coords } = userLocation || {};
                const { latitude, longitude /*, accuracy */ } = coords || {};
                const point = new Point(fromLonLat([longitude, latitude]));

                // const rgba = [...asArray( '#367c99')];
                //     rgba[3] = 0.25;
                // currentPositionLayerBg.current.setStyle(new Style({
                //     image: new Circle({
                //         radius: 40,
                //         fill: new Fill({ color: rgba }),
                //     }),
                // }))
                currentPositionFeatureBg.current.setGeometry(point);
                currentPositionFeature.current.setGeometry(point);
            } else {
                currentPositionFeatureBg.current.setGeometry(null);
                currentPositionFeature.current.setGeometry(null);
            }
        }
    }, [userLocation]);

    useEffect(() => {
        if (isFollowingUser && userLocation !== null) {
            const { coords } = userLocation;
            const { latitude, longitude } = coords || {};
            setMapCenter([longitude, latitude]);
        }
    }, [isFollowingUser, userLocation, setMapCenter]);

    useEffect(() => {
        if (ready && acceptedLocation && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((location) => {
                setUserLocation(location);
                navigator.geolocation.watchPosition(
                    (location) => {
                        setUserLocation(location);
                    },
                    (error) => {
                        console.log(error);
                    },
                    { enableHighAccuracy: true },
                );
            });
        }
    }, [ready, acceptedLocation]);

    const onGeolocateClick = useCallback(() => {
        if (userLocation === null) {
            if ('geolocation' in navigator) {
                setLoadingUserPosition(true);
                navigator.geolocation.getCurrentPosition(
                    (location) => {
                        const { coords } = location || {};
                        const { latitude, longitude } = coords || {};
                        setUserLocation(location);
                        setLoadingUserPosition(false);
                        setAcceptedLocation(true);
                        Cookies.set('locationAccepted', true, { expires: 3600 });
                        setMapCenter([longitude, latitude]);
                    },
                    (error) => {
                        const { message } = error || {};
                        window.alert(message);
                        setLoadingUserPosition(false);
                    },
                );
            }
        } else {
            const currentCenter = getMapCenter();
            const { coords } = userLocation || {};
            const { latitude, longitude } = coords || {};
            const newCenter = [longitude, latitude];

            if (!isFollowingUser && isSameLocation(currentCenter, newCenter)) {
                setIsFollowingUser(true);
                if (getMapZoom() < followUserZoom) {
                    setMapZoom(followUserZoom);
                }
            } else {
                setIsFollowingUser(false);
            }
            setMapCenter(newCenter);
        }
    }, [
        userLocation,
        getMapCenter,
        setMapCenter,
        isSameLocation,
        isFollowingUser,
        followUserZoom,
        getMapZoom,
        setMapZoom,
    ]);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.isHover]: isHover,
                    [styles.isMobile]: isMobile,
                    [styles.isFollowingUser]: isFollowingUser,
                },
            ])}
        >
            <div ref={mapContainerRef} className={styles.map} touch-action="none" />
            <div className={styles.markers}>
                {markerIcons.map(({ color, icon, withoutMarker }, iconIndex) => (
                    <MapMarker
                        key={`marker-${iconIndex}`}
                        ref={(el) => {
                            markerIconsRef.current[`${icon}${color}`] = el;
                        }}
                        icon={icon}
                        color={color}
                        withoutMarker={withoutMarker}
                        onLoad={() => {
                            onMarkerIconLoaded(`${icon}${color}`);
                        }}
                    />
                ))}
            </div>
            <button className={styles.geolocateButton} type="button" onClick={onGeolocateClick}>
                <FontAwesomeIcon icon={faLocation} />
            </button>
            <Loading loading={loadingUserPosition} />
        </div>
    );
}

Map.propTypes = propTypes;
Map.defaultProps = defaultProps;

export default Map;
