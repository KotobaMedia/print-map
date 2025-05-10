import { Map } from "maplibre-gl";

async function renderToImage(
  map: Map
): Promise<string> {
  const mapCanvas = map.getCanvas();
  // what we do is create a new map with the same style and view state, and get the image from the canvas
  const container = document.createElement("div");
  // A4 dimesions
  container.style.width = mapCanvas.clientWidth + "px";
  container.style.height = mapCanvas.clientHeight + "px";
  container.style.position = "absolute";
  container.style.top = "0";
  container.style.visibility = "hidden";
  container.style.zIndex = "-99999";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const style = map.getStyle();
  style.layers = style.layers.filter((layer) => {
    if (layer.id.startsWith("gl-draw")) {
      return false;
    }
    return true;
  });

  const printMap = new Map({
    container,
    style,
    center: map.getCenter(),
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    interactive: false,
    hash: false,
    attributionControl: false,
    canvasContextAttributes: {
      preserveDrawingBuffer: true,
    },
    pixelRatio: 4,
  });
  await Promise.all([
    printMap.once('load'),
    printMap.once('idle')
  ]);
  const canvas = printMap.getCanvas();
  const image = canvas.toDataURL("image/png");
  printMap.remove();
  container.remove();
  return image;
}

export default renderToImage;
