import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { fromLonLat, transform } from 'ol/proj';
import { Point, LineString } from 'ol/geom';
import { VectorImage, Tile as TileLayer } from 'ol/layer';
import { Cluster, Vector as VectorSource, XYZ, OSM } from 'ol/source';
import { Style, Stroke, Icon, Fill, Text } from 'ol/style';
import { boundingExtent } from 'ol/extent';
import View from 'ol/View';
import { default as OlMap } from 'ol/Map';
import Feature from 'ol/Feature';
import { defaults as defaultInteractions } from 'ol/interaction/defaults';

import { getColoredIcons } from '../../lib/map';
import MapMarker from './MapMarker';
import Loading from '../partials/Loading';

import styles from '../../styles/map/map.module.scss';

const isDev = process.env.NODE_ENV !== 'production';
const jawgId = process.env.REACT_APP_JAWG_ID;
const jawgToken = process.env.REACT_APP_JAWG_TOKEN;

const propTypes = {
    className: PropTypes.string,
    disableInteractions: PropTypes.bool,
    askForPosition: PropTypes.bool,
    mapCenter: PropTypes.arrayOf(PropTypes.number),
    defaultMapCenter: PropTypes.arrayOf(PropTypes.number),
    zoom: PropTypes.number,
    defaultZoom: PropTypes.number,
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
    onPositionRefused: PropTypes.func,
    onMarkerClick: PropTypes.func,
    onLineClick: PropTypes.func,
    onReady: PropTypes.func,
};

const defaultProps = {
    className: null,
    disableInteractions: false,
    askForPosition: false,
    mapCenter: null,
    defaultMapCenter: [-73.561668, 45.508888],
    zoom: null,
    defaultZoom: 15,
    maxZoom: 20,
    lines: null,
    markers: null,
    clusterDistance: 25,
    clusterMinDistance: 20,
    onMoveEnded: null,
    onCenterChanged: null,
    onZoomChanged: null,
    onPositionRefused: null,
    onMarkerClick: null,
    onLineClick: null,
    onReady: null,
};

function Map({
    className,
    disableInteractions,
    askForPosition,
    mapCenter,
    defaultMapCenter,
    zoom,
    defaultZoom,
    maxZoom,
    lines,
    markers,
    clusterDistance,
    clusterMinDistance,
    onMoveEnded,
    onCenterChanged,
    onZoomChanged,
    onPositionRefused,
    onMarkerClick,
    onLineClick,
    onReady,
}) {
    const markerIconsRef = useRef([]);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [isHover, setIsHover] = useState(false);

    const [ready, setReady] = useState(false);
    const [loadingUserPosition, setLoadingUserPosition] = useState(false);

    const storedLines = useRef([]);
    const storedMarkers = useRef([]);

    const [iconsLoaded, setIconLoaded] = useState(
        getColoredIcons().map(({ icon, color }) => ({ key: `${icon}${color}`, loaded: false })),
    );
    const allIconsLoaded = useMemo(
        () => iconsLoaded.filter(({ loaded }) => !loaded).length === 0,
        [iconsLoaded],
    );
    const onMarkerIconLoaded = useCallback((icon) => {
        setIconLoaded((old) =>
            old.map(({ key, loaded }) => ({ key, loaded: key === icon ? true : loaded })),
        );
    }, []);

    const onChangeCenter = useCallback(() => {
        if (onCenterChanged !== null) {
            onCenterChanged(
                transform(mapRef.current.getView().getCenter(), 'EPSG:3857', 'EPSG:4326'),
            );
        }
    }, [onCenterChanged]);

    const onChangeZoom = useCallback(() => {
        if (onZoomChanged !== null) {
            onZoomChanged(mapRef.current.getView().getZoom());
        }
    }, [onZoomChanged]);

    const onMoveEnd = useCallback(() => {
        if (onMoveEnded !== null) {
            onMoveEnded({
                center: transform(mapRef.current.getView().getCenter(), 'EPSG:3857', 'EPSG:4326'),
                zoom: mapRef.current.getView().getZoom(),
            });
        }
    }, [onMoveEnded]);

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

    const initMap = useCallback(
        (target) => {
            const view = new View({
                enableRotation: false,
                center: fromLonLat(mapCenter || defaultMapCenter),
                zoom: zoom !== null ? zoom : defaultZoom,
                maxZoom,
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
                                  url: `https://tile.jawg.io/${jawgId}/{z}/{x}/{y}.png?access-token=${jawgToken}`,
                              }),
                    }),
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

                const { features: linesFeatures, color = '#0000FF', width = 5 } = lines || {};
                const layer = new VectorImage({
                    source: vectorSource,
                    style: new Style({
                        stroke: new Stroke({ color, width }),
                    }),
                });

                mapRef.current.addLayer(layer);
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
                // const { visible = false} = data;
                // feature.setStyle(visible ? undefined : new Style({}));
                return feature;
            }

            markerGroups.forEach((markers, groupIndex) => {
                const cacheGroup = storedMarkers.current[groupIndex] || null;
                if (cacheGroup !== null) {
                    const { source /* , layer */ } = cacheGroup;
                    const { features } = markers;
                    cacheGroup.features = cacheGroup.features.filter((featureObject) => {
                        const { id: featureId, feature } = featureObject;
                        const foundFeature =
                            (features.find(({ data: { id } }) => id === featureId) || null) !==
                            null;
                        if (!foundFeature) {
                            source.removeFeature(feature);
                        }
                        return foundFeature;
                    });
                    features.forEach((object) => {
                        const { data } = object;
                        const { id, visible = false } = data;
                        const existingFeatureIndex =
                            cacheGroup.features.findIndex(({ id: featureId }) => id === featureId);
                        const existing = existingFeatureIndex > -1 ? cacheGroup.features[existingFeatureIndex] : null;
                        if (visible) {
                            if (existing === null) {
                                const feature = addFeature(object);
                                source.addFeature(feature);
                                cacheGroup.features.push({ feature, id });
                            }
                        } else if (existing !== null) {
                            const { feature } = existing;
                            source.removeFeature(feature);
                            cacheGroup.features.splice(existingFeatureIndex, 1);
                        }
                    });

                    // const visibleFeatures = features.filter(
                    //     ({ data: { visible = false } }) => visible,
                    // );
                    // layer.setVisible(visibleFeatures.length > 0);
                } else {
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
                        // visible: visibleFeatures.length > 0,
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
                                        imgSize:
                                            src === undefined ? [img.width, img.height] : undefined,
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
                            // return visibleFeatures.length > 0 ? style : new Style({});
                        },
                    });

                    mapRef.current.addLayer(layer);
                    storedMarkers.current[groupIndex] = {
                        layer,
                        source: vectorSource,
                        features: visibleFeatures.map((object) => {
                            const { data } = object;
                            const { id } = data;
                            const feature = addFeature(object);
                            vectorSource.addFeature(feature);
                            return { feature, id };
                        }),
                    };
                }
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
                mapRef.current.getView().setCenter(transform(mapCenter, 'EPSG:4326', 'EPSG:3857'));
            }
        }
    }, [mapCenter]);

    useEffect(() => {
        if (mapRef.current !== null && zoom !== null) {
            if (zoom !== mapRef.current.getView().getZoom()) {
                mapRef.current.getView().setZoom(zoom);
            }
        }
    }, [zoom]);

    useEffect(() => {
        const success = (position) => {
            setLoadingUserPosition(false);
            mapRef.current
                .getView()
                .setCenter(
                    transform(
                        [position.coords.longitude, position.coords.latitude],
                        'EPSG:4326',
                        'EPSG:3857',
                    ),
                );
        };

        const onNoPosition = () => {
            if (onPositionRefused !== null) {
                onPositionRefused();
            }
        };

        const error = () => {
            setLoadingUserPosition(false);
            onNoPosition();
        };

        if (askForPosition && ready) {
            if (navigator.geolocation) {
                setLoadingUserPosition(true);
                navigator.geolocation.getCurrentPosition(success, error);
            } else {
                onNoPosition();
            }
        }
    }, [askForPosition, ready, onPositionRefused]);

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
                onReady(mapRef.current);
            }
        }
    }, [ready, onReady]);

    const markerIcons = useMemo(() => getColoredIcons(), []);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.isHover]: isHover,
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
            <Loading loading={loadingUserPosition} />
        </div>
    );
}

Map.propTypes = propTypes;
Map.defaultProps = defaultProps;

export default Map;
