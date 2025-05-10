import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import type { Feature, Polygon } from 'geojson';
import {useControl} from 'react-map-gl/maplibre';
import type {ControlPosition, IControl} from 'react-map-gl/maplibre';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(MapboxDraw.constants.classes as any).CONTROL_BASE = 'maplibregl-ctrl';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(MapboxDraw.constants.classes as any).CONTROL_PREFIX = 'maplibregl-ctrl-';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(MapboxDraw.constants.classes as any).CONTROL_GROUP = 'maplibregl-ctrl-group';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(MapboxDraw.constants.classes as any).ATTRIBUTION = 'maplibregl-ctrl-attrib';

export type DrawFeature = Feature<Polygon>;

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;

  initialFeatures?: DrawFeature[];

  onCreate?: (evt: {features: DrawFeature[]}) => void;
  onUpdate?: (evt: {features: DrawFeature[]; action: string}) => void;
  onDelete?: (evt: {features: DrawFeature[]}) => void;
};

export default function DrawControl(props: DrawControlProps) {
  const draw: MapboxDraw = useControl(
    () => {
      return new MapboxDraw(props) as unknown as IControl;
    },
    ({map}) => {
      if (props.onCreate) map.on('draw.create', props.onCreate);
      if (props.onUpdate) map.on('draw.update', props.onUpdate);
      if (props.onDelete) map.on('draw.delete', props.onDelete);
      if (props.initialFeatures) {
        map.once('load', () => {
          draw.set({
            type: 'FeatureCollection',
            features: props.initialFeatures || [],
          });
        });
      }
    },
    ({map}) => {
      if (props.onCreate) map.off('draw.create', props.onCreate);
      if (props.onUpdate) map.off('draw.update', props.onUpdate);
      if (props.onDelete) map.off('draw.delete', props.onDelete);
    },
    {
      position: props.position
    }
  ) as unknown as MapboxDraw;

  return null;
}

DrawControl.defaultProps = {
  onCreate: () => {},
  onUpdate: () => {},
  onDelete: () => {}
};