import './App.css';
import MaplibreGL, { AttributionControl, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import DrawControl from './draw-control';
import drawTheme from './draw-theme';
import { useCallback, useState } from 'react';
import type { Feature } from 'geojson';

function App() {
  const [maskPolygon, setMaskPolygon] = useState(null);

  const drawUpdate = useCallback<(e: { features: Feature[] }) => void>((e) => {
    const { features } = e;
    console.log('drawUpdate', features);
  }, []);

  return (
    <div className="App">
      <MaplibreGL
        initialViewState={{
          latitude: 30.35,
          longitude: 130.53,
          zoom: 9.5,
        }}
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
          onCreate={drawUpdate}
          onUpdate={drawUpdate}
          onDelete={drawUpdate}
        />
      </MaplibreGL>
    </div>
  );
}

export default App;
