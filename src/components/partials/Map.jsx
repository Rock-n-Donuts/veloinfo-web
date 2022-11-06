import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { fromLonLat, transform } from 'ol/proj';
import { Point, LineString } from 'ol/geom';
import { Tile as TileLayer, Vector as LayerVector } from 'ol/layer';
import { Cluster, OSM, Vector as VectorSource } from 'ol/source';
import { Style, Stroke, Icon } from 'ol/style';
import { boundingExtent } from 'ol/extent';
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
                    new TileLayer({
                        source: new OSM(),
                    }),
                ],
            }));
            map.getView().on('change:center', onChangeCenter);
            map.getView().on('change:resolution', onChangeZoom);

            map.on('click', (e) => {
                linesLayers.current.forEach((layer) => {
                    layer.getFeatures(e.pixel).then((clickedFeatures) => {
                        if (clickedFeatures.length) {
                            const clickedFeature = clickedFeatures[0];
                            const featureAttributes = clickedFeature.get('attributes');
                            if (onLineClick !== null && featureAttributes.clickable) {                                
                                onLineClick(featureAttributes);
                            }
                        }
                    });
                });
                markerLayers.current.forEach((layer) => {
                    layer.getFeatures(e.pixel).then((clickedFeatures) => {
                        if (clickedFeatures.length) {
                            const clickedFeature = clickedFeatures[0];
                            const features = clickedFeature.get('features');
                            if (features.length > 1) {
                                const extent = boundingExtent(
                                    features.map((r) => r.getGeometry().getCoordinates()),
                                );
                                map.getView().fit(extent, {
                                    duration: 1000,
                                    padding: [100, 100, 100, 100],
                                });
                            } else {
                                const feature = features[0];
                                const featureAttributes = feature.get('attributes');
                                if (onMarkerClick !== null && featureAttributes.clickable) {
                                    onMarkerClick(featureAttributes);
                                }
                            }
                        }
                    });
                });
            });
            setReady(true);
        },
        [mapCenter, zoom, onChangeCenter, onChangeZoom, setReady, onMarkerClick, onLineClick],
    );

    const drawLines = useCallback((lines) => {
        const vectorSource = new VectorSource({});

        const { features, color = '#0000FF', width = 5 } = lines || {};

        features.forEach(({ coords, data = null, clickable = false }) => {
            const points = coords.map((coord) => transform(coord, 'EPSG:4326', 'EPSG:3857'));
            vectorSource.addFeature(
                new Feature({
                    geometry: new LineString(points),
                    attributes: { ...data, clickable },
                }),
            );
        });
        const vectorLineLayer = new LayerVector({
            source: vectorSource,
            style: new Style({
                stroke: new Stroke({ color, width }),
            }),
        });

        mapRef.current.addLayer(vectorLineLayer);
        linesLayers.current.push(vectorLineLayer);
        return vectorLineLayer;
    }, []);

    const addMarkers = useCallback((markers) => {
        const { features, src, image, scale } = markers || {};

        const vectorSource = new VectorSource({});

        features.forEach(({ coords, data = null, clickable = false }) => {
            vectorSource.addFeature(
                new Feature({
                    geometry: new Point(fromLonLat(coords)),
                    attributes: { ...data, clickable },
                }),
            );
        });

        const clusterSource = new Cluster({
            distance: 40,
            minDistance: 5,
            source: vectorSource,
        });

        const styleCache = {};
        const clusters = new LayerVector({
            source: clusterSource,
            style: function (feature) {
                const size = feature.get('features').length;
                let style = styleCache[size];
                if (!style) {
                    style = new Style({
                        image: new Icon({
                            anchor: [0.5, 1],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            src,
                            image,
                            scale,
                        }),
                    });
                    styleCache[size] = style;
                }
                return style;
            },
        });

        mapRef.current.addLayer(clusters);
        markerLayers.current.push(clusters);
        return clusters;
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
