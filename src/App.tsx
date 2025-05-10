import './App.css';
import MaplibreGL, { AttributionControl, Layer, NavigationControl, Source, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import DrawControl, { type DrawFeature } from './map/draw-control.tsx';
import drawTheme from './map/draw-theme.ts';
import * as turf from '@turf/helpers';
import world from './map/world-geojson.ts';
import turfDifference from '@turf/difference';
import turfUnion from '@turf/union';
import { useCallback, useState, useMemo, useEffect } from 'react';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import PrintControl from './map/print-control.tsx';

type FCP = FeatureCollection<Polygon | MultiPolygon>;
const EMPTY_FC: FCP = turf.featureCollection([]);

type FeatureState = Record<string, Feature<Polygon>>;

function App() {
  const [features, setFeatures] = useState<FeatureState>({});

  const onUpdate = useCallback<(evt: {features: DrawFeature[]}) => void>((e) => {
    setFeatures(currFeatures => {
      const newFeatures = {...currFeatures};
      for (const f of e.features) {
        newFeatures[f.id!] = f;
      }
      return newFeatures;
    });
  }, []);

  const onDelete = useCallback<(evt: {features: DrawFeature[]}) => void>((e) => {
    setFeatures(currFeatures => {
      const newFeatures = {...currFeatures};
      for (const f of e.features) {
        delete newFeatures[f.id!];
      }
      return newFeatures;
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('features', JSON.stringify(features));
    } catch (_e) {
      // ignore
    }
  }, [features]);

  const initialFeatures = useMemo(() => {
    try {
      const initial = localStorage.getItem('features');
      if (initial) {
        const features = JSON.parse(initial) as FeatureState;
        // i know this should be in a useEffect, but i'm lazy
        setFeatures(features);
        return Object.values(features);
      }
    } catch (_e) {
      // ignore
    }
  }, []);

  const maskPolygon = useMemo(() => {
    const fcp = turf.featureCollection(Object.values(features));
    if (fcp.features.length === 0) {
      return EMPTY_FC;
    }

    const union = fcp.features.length === 1 ? fcp.features[0] : turfUnion(fcp);
    if (union === null) {
      return EMPTY_FC;
    }
    const mask = turfDifference(turf.featureCollection([world, union]));
    return mask ? turf.featureCollection([mask]) : EMPTY_FC;
  }, [features]); 

  return (
    <div className="page-frame">
      <div className="map-container">
        <MaplibreGL
          initialViewState={{
            latitude: 30.35,
            longitude: 130.53,
            zoom: 9.5,
          }}
          maxPitch={0}
          hash={true}
          attributionControl={false}
          mapStyle={'https://tiles.kmproj.com/styles/print-handwriting.json'}
        >
          <AttributionControl position="bottom-right" customAttribution={'<a href="https://kotobamedia.com/">© KotobaMedia</a>'} />
          <NavigationControl position="top-right" />
          <DrawControl
            position='top-right'
            displayControlsDefault={false}
            controls={{
              polygon: true,
              trash: true,
            }}
            styles={drawTheme}
            initialFeatures={initialFeatures || []}
            onCreate={onUpdate}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
          <PrintControl />

          <Source id="mask" type="geojson" data={maskPolygon}>
            <Layer 
              id="mask"
              type="fill"
              source="mask"
              paint={{
                'fill-color': '#000000',
                'fill-opacity': 0.5,
              }}
            />
          </Source>
        </MaplibreGL>
      </div>
    </div>
  );
}

export default App;
