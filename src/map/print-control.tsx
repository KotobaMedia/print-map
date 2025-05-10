import type { ControlPosition, IControl } from "maplibre-gl";
import { useControl } from "react-map-gl/maplibre";
import renderToImage from "./render-to-image";

class IPrintControl implements IControl {
  container: HTMLDivElement;
  map?: maplibregl.Map;

  constructor() {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    const button = document.createElement("button");
    button.className = "maplibregl-ctrl-icon maplibregl-ctrl-print";
    button.type = "button";
    button.title = "Print";
    button.innerText = "印刷";
    button.onclick = () => {
      this.doPrint().catch((e) => {
        console.error("Error printing map", e);
        alert("Error printing map, try again later");
      });
    };
    this.container.appendChild(button);
  }

  onAdd(map: maplibregl.Map) {
    this.map = map;
    return this.container;
  }

  onRemove(_map: maplibregl.Map) {
    this.map = undefined;
    this.container.parentNode?.removeChild(this.container);
  }

  private async doPrint() {
    if (!this.map) {
      console.warn("Trying to print before map is ready");
      return;
    }

    const imageUrl = await renderToImage(this.map);
    const handle = open("about:blank", "Print");
    if (!handle) {
      alert("Please allow popups for this website");
      return;
    }

    // Write a minimal HTML skeleton for cross-browser compatibility
    handle.document.write(`
      <html>
        <head>
          <title>Print</title>
        </head>
        <body></body>
      </html>
    `);
    handle.document.close();

    // Wait for the new window to finish loading
    const injectContent = () => {
      const style = handle.document.createElement("style");
      style.textContent = `
        :root {
          font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
        }
        @page {
          size: A4 landscape;
          margin: 5mm;
        }
        body {
          margin: 0;
          padding: 0;
        }
        img {
          display: block;
          width: 100%;
          height: 100%;
        }
      `;
      handle.document.head.appendChild(style);

      const img = handle.document.createElement("img");
      img.src = imageUrl;

      const attribution = handle.document.createElement("p");
      attribution.id = "attribution";
      attribution.style.position = "absolute";
      attribution.style.bottom = "0";
      attribution.style.right = "0";
      attribution.style.background = "white";
      attribution.style.margin = "0";
      attribution.style.padding = "5px";
      attribution.style.fontSize = "10px";
      attribution.textContent = "https://print-map.kmproj.com | © OpenStreetMap";

      handle.document.body.appendChild(img);
      handle.document.body.appendChild(attribution);

      img.onload = () => {
        handle.focus();
        handle.print();
      };
      img.onerror = () => {
        alert("Failed to load map image for printing.");
        handle.close();
      };
    };

    if (handle.document.readyState === "complete" || handle.document.readyState === "interactive") {
      injectContent();
    } else {
      handle.addEventListener("load", injectContent, { once: true });
    }
  }
}

type PrintControlProps = /*ConstructorParameters<typeof IPrintControl>[0] &*/ {
  position?: ControlPosition;
}

export default function PrintControl(props: PrintControlProps) {
  useControl(
    () => new IPrintControl(),
    () => {
      // No event listeners to add
    },
    () => {
      // No event listeners to remove
    },
    {
      position: props.position,
    }
  )
  return null;
}
