import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import type { Feature } from 'geojson';
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

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;

  onCreate?: (evt: {features: Feature[]}) => void;
  onUpdate?: (evt: {features: Feature[]; action: string}) => void;
  onDelete?: (evt: {features: Feature[]}) => void;
};

export default function DrawControl(props: DrawControlProps) {
  useControl(
    () => new MapboxDraw(props) as unknown as IControl,
    ({map}) => {
      if (props.onCreate) map.on('draw.create', props.onCreate);
      if (props.onUpdate) map.on('draw.update', props.onUpdate);
      if (props.onDelete) map.on('draw.delete', props.onDelete);
    },
    ({map}) => {
      if (props.onCreate) map.off('draw.create', props.onCreate);
      if (props.onUpdate) map.off('draw.update', props.onUpdate);
      if (props.onDelete) map.off('draw.delete', props.onDelete);
    },
    {
      position: props.position
    }
  );

  return null;
}

DrawControl.defaultProps = {
  onCreate: () => {},
  onUpdate: () => {},
  onDelete: () => {}
};