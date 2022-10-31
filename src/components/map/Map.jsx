import { useCallback, useEffect, useRef } from 'react';

import { fromLonLat, transform } from 'ol/proj';
import { Point, LineString } from 'ol/geom';
import { Tile, Vector as LayerVector } from 'ol/layer';
import { OSM, Vector } from 'ol/source';
import { Style, Fill, Stroke, Icon } from 'ol/style';
import View from 'ol/View';
import Map from 'ol/Map';
import Feature from 'ol/Feature';

import styles from './Map.module.scss';

function MapContainer() {
    const containerRef = useRef(null);
    const mapRef = useRef(null);

    const initMap = useCallback((target) => {
        const point = { lat: 45.508888, lon: -73.561668 };
        const currentPoint = fromLonLat([point.lon, point.lat]);
        const currentZoom = 14;

        const view = new View({
            center: currentPoint,
            zoom: currentZoom !== null ? currentZoom : 13,
        });

        mapRef.current = new Map({
            target,
            view,
            layers: [
                new Tile({
                    source: new OSM(),
                }),
            ],
        });

    }, []);

    // eslint-disable-next-line no-unused-vars
    const drawLine = useCallback((coords) => {
        const points = coords.map((coord) => transform(coord, 'EPSG:4326', 'EPSG:3857'));

        const featureLine = new Feature({
            geometry: new LineString(points),
        });

        const vectorLine = new Vector({});
        vectorLine.addFeature(featureLine);

        const vectorLineLayer = new Vector({
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
                mapRef.current = null;
            }
        };
    }, [initMap]);

    return <div ref={containerRef} className={styles.container} />;
}

export default MapContainer;
