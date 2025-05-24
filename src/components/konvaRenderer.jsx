import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Circle, Image as KonvaImage, Group } from "react-konva";

function useImage(url) {
  const [image, setImage] = React.useState(null);
  React.useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.src = url;
    img.onload = () => setImage(img);
  }, [url]);
  return image;
}

// Helper: interpolate between multiple colors for heatmap
function interpolateColor(colors, t) {
  const n = colors.length - 1;
  const idx = Math.floor(t * n);
  const frac = t * n - idx;
  const hexToRgb = hex => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
  const rgbToHex = rgb =>
    "#" +
    rgb
      .map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");
  const c1 = hexToRgb(colors[idx]);
  const c2 = hexToRgb(colors[Math.min(idx + 1, n)]);
  const rgb = c1.map((v, i) => v + (c2[i] - v) * frac);
  return rgbToHex(rgb);
}

function getCircleColor(period, sensor) {
  if (!sensor) return "gray";
  if (period === "tiempo-real") {
    return sensor.estado === 1 ? "#4caf50" : "#f44336"; // green or red
  }
  if (period === "rotacion" || period === "ocupacion") {
    // Heatmap: blue → green → yellow → red
    const value =
      period === "rotacion"
        ? sensor.frecuencia ?? 0
        : sensor.ocupacion ?? 0;
    return interpolateColor(
      ["#2196f3", "#4caf50", "#ffeb3b", "#f44336"],
      Math.max(0, Math.min(1, value))
    );
  }
  return "gray";
}

const KonvaRenderer = ({
  stage,
  objects,
  backgroundUrl,
  period,
  sensorData = [],
}) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const scaleX = containerWidth / stage.width;
        const scaleY = containerHeight / stage.height;
        setScale(Math.min(scaleX, scaleY));
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [stage.width, stage.height]);

  const bgImage = useImage(backgroundUrl);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "80vh",
        overflow: "hidden",
        margin: "0 auto",
        position: "relative"
      }}
    >
      <Stage
        width={stage.width}
        height={stage.height}
        scale={{ x: scale, y: scale }}
        style={{ background: "transparent" }}
      >
        <Layer>
          {bgImage && (
            <KonvaImage
              image={bgImage}
              x={0}
              y={0}
              width={stage.width}
              height={stage.height}
              listening={false}
            />
          )}
          {objects.map((obj, idx) => {
            const sensor = sensorData.find(s => s.linkedKonvaId === obj.id);
            return (
              <Group
                key={obj.id}
                x={obj.rect.x}
                y={obj.rect.y}
                rotation={obj.rect.rotation}
              >
                <Rect
                  x={0}
                  y={0}
                  width={obj.rect.width}
                  height={obj.rect.height}
                  fill={obj.rect.fill}
                  stroke={obj.rect.stroke}
                  strokeWidth={obj.rect.strokeWidth}
                />
                {obj.circle && (
                  <Circle
                    x={obj.rect.width / 2}
                    y={obj.rect.height / 2}
                    radius={obj.circle.radius}
                    fill={getCircleColor(period, sensor)}
                    stroke={obj.circle.stroke}
                    strokeWidth={obj.circle.strokeWidth}
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaRenderer;