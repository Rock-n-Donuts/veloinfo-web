import { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Cookie from 'js-cookie';

import { fromLonLat, transform } from 'ol/proj';
import { Point, LineString } from 'ol/geom';
import { Tile, Vector as LayerVector } from 'ol/layer';
import { OSM, Vector } from 'ol/source';
import { Style, Fill, Stroke, Icon } from 'ol/style';
import View from 'ol/View';
import { default as OlMap } from 'ol/Map';
import Feature from 'ol/Feature';

import { useTroncons } from '../../contexts/DataContext';

import styles from '../../styles/partials/map.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
    defaultCenter: [-73.561668, 45.508888],
    defaultZoom: 14,
};

function Map({ className, defaultCenter, defaultZoom }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);

    const mapCenter = Cookie.get('mapCenter') || null;
    const mapZoom = Cookie.get('mapZoom') || null;
    const initialCenter = useMemo(
        () => (mapCenter !== null ? JSON.parse(mapCenter) : defaultCenter),
        [mapCenter, defaultCenter],
    );
    const initialZoom = mapZoom || defaultZoom;

    const troncons = useTroncons();

    const initMap = useCallback(
        (target) => {
            const view = new View({
                center: fromLonLat(initialCenter),
                zoom: initialZoom,
            });

            mapRef.current = new OlMap({
                target,
                view,
                layers: [
                    new Tile({
                        source: new OSM(),
                    }),
                ],
            });

            mapRef.current.getView().on('change:resolution', () => {
                Cookie.set('mapZoom', mapRef.current.getView().getZoom(), { expires: 3650 });
            });
            mapRef.current.getView().on('change:center', () => {
                Cookie.set(
                    'mapCenter',
                    JSON.stringify(
                        transform(mapRef.current.getView().getCenter(), 'EPSG:3857', 'EPSG:4326'),
                    ),
                    { expires: 3650 },
                );
            });
        },
        [initialCenter, initialZoom],
    );

    const drawLine = useCallback((coords) => {
        const points = coords.map((coord) => transform(coord, 'EPSG:4326', 'EPSG:3857'));

        const featureLine = new Feature({
            geometry: new LineString(points),
        });

        const vectorLine = new Vector({});
        vectorLine.addFeature(featureLine);

        const vectorLineLayer = new LayerVector({
            
            source: vectorLine,
            style: new Style({
                fill: new Fill({ color: '#0000FF', weight: 6 }),
                stroke: new Stroke({ color: '#0000FF', width: 4 }),
            }),
        });

        mapRef.current.addLayer(vectorLineLayer);

        return vectorLineLayer;
    }, []);

    // eslint-disable-next-line no-unused-vars
    const addMarker = useCallback((coords, type, info) => {
        const point = fromLonLat(coords);
        const iconFeature = new Feature({
            geometry: new Point(point),
        });

        const marker = new LayerVector({
            source: new Vector({
                features: [iconFeature],
            }),
            style: new Style({
                image: new Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: 'marker.png',
                }),
            }),
        });
        mapRef.current.addLayer(marker);
    }, []);

    useEffect(() => {
        const { current: container = null } = containerRef;
        const { current: map = null } = mapRef;

        if (container && map === null) {
            initMap(container);
        }

        return () => {
            if (map) {
                container.innerHTML = '';
                mapRef.current = null;
            }
        };
    }, [initMap]);

    useEffect(() => {
        let lines = [];
        if (troncons !== null) {
            lines = troncons.filter((_, i) => i < 100).map(({ coords }) => drawLine(coords));
        }

        return () => {
            if (mapRef.current !== null && lines !== null) {
                lines.forEach((line) => mapRef.current.removeLayer(line));
            }
        };
    }, [troncons, drawLine]);

    return (
        <div
            ref={containerRef}
            className={classNames([styles.container, { [className]: className !== null }])}
        />
    );
}

Map.propTypes = propTypes;
Map.defaultProps = defaultProps;

export default Map;
