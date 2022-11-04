import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { fromLonLat, transform } from 'ol/proj';
import { Point, LineString } from 'ol/geom';
import { Tile, Vector as LayerVector } from 'ol/layer';
import { OSM, Vector } from 'ol/source';
import { Style, Stroke, Icon } from 'ol/style';
import View from 'ol/View';
import { default as OlMap } from 'ol/Map';
import Feature from 'ol/Feature';

import Loading from './Loading';

import styles from '../../styles/partials/map.module.scss';

const propTypes = {
    className: PropTypes.string,
    askForPosition: PropTypes.bool,
    mapCenter: PropTypes.arrayOf(PropTypes.number),
    zoom: PropTypes.number,
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
    onCenterChanged: PropTypes.func,
    onZoomChanged: PropTypes.func,
    onPositionRefused: PropTypes.func,
    onMarkerClick: PropTypes.func,
    onLineClick: PropTypes.func,
    onReady: PropTypes.func,
};

const defaultProps = {
    className: null,
    askForPosition: false,
    mapCenter: [-73.561668, 45.508888],
    zoom: 15,
    lines: null,
    markers: null,
    onCenterChanged: null,
    onZoomChanged: null,
    onPositionRefused: null,
    onMarkerClick: null,
    onLineClick: null,
    onReady: null,
};

function Map({
    className,
    askForPosition,
    mapCenter,
    zoom,
    lines,
    markers,
    onCenterChanged,
    onZoomChanged,
    onPositionRefused,
    onMarkerClick,
    onLineClick,
    onReady,
}) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [isHover, setIsHover] = useState(false);

    const [ready, setReady] = useState(false);
    const [loadingUserPosition, setLoadingUserPosition] = useState(false);

    const linesLayers = useRef([]);
    const markerLayers = useRef([]);

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

    const initMap = useCallback(
        (target) => {
            const view = new View({
                center: fromLonLat(mapCenter),
                zoom,
            });

            const map = (mapRef.current = new OlMap({
                target,
                view,
                layers: [
                    new Tile({
                        source: new OSM(),
                    }),
                ],
            }));
            map.getView().on('change:center', onChangeCenter);
            map.getView().on('change:resolution', onChangeZoom);

            const getFeatureUnderPixel = (container, pixel, cb) => {
                let found = false;

                container.forEach((vectorLayer) => {
                    if (!found) {
                        vectorLayer.getFeatures(pixel).then(function (features) {
                            const feature = features.length ? features[0] : null;

                            if (feature !== null && feature.get('attributes').clickable && !found) {
                                found = true;
                                if (cb) {
                                    cb(feature);
                                }
                            }
                        });
                    }
                });
                setIsHover(found);
            };
            map.on('pointermove', (e) => {
                if (e.dragging) {
                    return;
                }
                const pixel = map.getEventPixel(e.originalEvent);
                setIsHover(false);
                getFeatureUnderPixel(
                    [...linesLayers.current, ...markerLayers.current],
                    pixel,
                    () => {
                        setIsHover(true);
                    },
                );
            });

            map.on('click', (e) => {
                if (e.dragging) {
                    return;
                }
                const pixel = map.getEventPixel(e.originalEvent);
                getFeatureUnderPixel(linesLayers.current, pixel, (feature) => {
                    if (onLineClick !== null) {
                        onLineClick(feature.get('attributes'));
                    }
                });
                getFeatureUnderPixel(markerLayers.current, pixel, (feature) => {
                    if (onMarkerClick !== null) {
                        onMarkerClick(feature.get('attributes'));
                    }
                });
            });
            setReady(true);
        },
        [mapCenter, zoom, onChangeCenter, onChangeZoom, setReady, onMarkerClick, onLineClick],
    );

    const drawLines = useCallback((lines) => {
        const vectorLayer = new Vector({});

        const { features, color = '#0000FF', width = 5 } = lines || {};

        features.forEach(({ coords, data = null, clickable = false }) => {
            const points = coords.map((coord) => transform(coord, 'EPSG:4326', 'EPSG:3857'));
            vectorLayer.addFeature(
                new Feature({
                    geometry: new LineString(points),
                    attributes: { ...data, clickable },
                }),
            );
        });
        const vectorLineLayer = new LayerVector({
            source: vectorLayer,
            style: new Style({
                stroke: new Stroke({ color, width }),
            }),
        });

        mapRef.current.addLayer(vectorLineLayer);
        linesLayers.current.push(vectorLineLayer);
        return vectorLineLayer;
    }, []);

    const addMarkers = useCallback((markers) => {
        const { features, src, image } = markers || {};

        const vectorLayer = new Vector({});

        features.forEach(({ coords, data = null, clickable = false }) => {
            vectorLayer.addFeature(
                new Feature({
                    geometry: new Point(fromLonLat(coords)),
                    attributes: { ...data, clickable },
                }),
            );
        });

        const vectorIcon = new LayerVector({
            source: vectorLayer,
            style: new Style({
                image: new Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src,
                    image,
                }),
            }),
        });

        mapRef.current.addLayer(vectorIcon);
        markerLayers.current.push(vectorIcon);
        return vectorIcon;
    }, []);

    useEffect(() => {
        const { current: mapContainer = null } = mapContainerRef;
        const { current: map = null } = mapRef;

        if (mapContainer && map === null) {
            initMap(mapContainer);
        }

        return () => {
            if (map) {
                mapContainer.innerHTML = '';
                mapRef.current = null;
                setReady(false);
            }
        };
    }, [initMap, setReady]);

    useEffect(() => {
        if (mapRef.current !== null && mapCenter !== null) {
            mapRef.current.getView().setCenter(transform(mapCenter, 'EPSG:4326', 'EPSG:3857'));
        }
    }, [mapCenter]);

    useEffect(() => {
        if (mapRef.current !== null && zoom !== null) {
            mapRef.current.getView().setZoom(zoom);
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
        let layers = null;
        if (ready && lines !== null) {
            layers = lines.map((linesGroup) => drawLines(linesGroup));
        }

        return () => {
            if (layers !== null && mapRef.current !== null) {
                layers.forEach((layer) => {
                    mapRef.current.removeLayer(layer);
                    linesLayers.current = [];
                });
            }
        };
    }, [ready, lines, drawLines]);

    useEffect(() => {
        let layers = null;
        if (ready && markers !== null) {
            layers = markers.map((markersGroup) => addMarkers(markersGroup));
        }

        return () => {
            if (layers !== null && mapRef.current !== null) {
                layers.forEach((layer) => {
                    mapRef.current.removeLayer(layer);
                    markerLayers.current = [];
                });
            }
        };
    }, [ready, markers, addMarkers]);

    useEffect(() => {
        if (ready) {
            if (onReady !== null) {
                onReady(mapRef.current);
            }
        }
    }, [ready, onReady]);

    return (
        <div
            className={classNames([
                styles.container,
                { [className]: className !== null, [styles.isHover]: isHover },
            ])}
        >
            <div ref={mapContainerRef} className={styles.map} />
            <Loading loading={loadingUserPosition} />
        </div>
    );
}

Map.propTypes = propTypes;
Map.defaultProps = defaultProps;

export default Map;
