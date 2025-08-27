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

function getCircleColor(period, sensor, sensorStats, statsLoading) {
  if (statsLoading && (period === "rotacion" || period === "ocupacion")) return "gray";
  if (!sensor) return "gray";
  const stats = sensorStats?.find(s => s.sensor_id === sensor.sensor_id);

  if (period === "rotacion") {
    if (stats && stats.normalized_rotation != null && !isNaN(Number(stats.normalized_rotation))) {
      return interpolateColor(
        ["#2196f3", "#4caf50", "#ffeb3b", "#f44336"],
        Number(stats.normalized_rotation)
      );
    }
    return "gray";
  }

  if (period === "ocupacion") {
    if (stats && stats.occupation_percentage != null && !isNaN(Number(stats.occupation_percentage))) {
      return interpolateColor(
        ["#2196f3", "#4caf50", "#ffeb3b", "#f44336"],
        Number(stats.occupation_percentage) / 100
      );
    }
    return "gray";
  }

  if (period === "tiempo-real") {
    if (typeof sensor.current_state === "boolean") {
      return sensor.current_state ? "#4caf50" : "#f44336";
    }
    return "gray";
  }

  return "gray";
}

const KonvaRenderer = ({
  stage,
  objects,
  backgroundUrl,
  period,
  sensorData = [],
  sensorStats = [],
  statsLoading 
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
            const sensor = sensorData.find(s => s.konva_id === obj.id);
            const stats = sensor && sensorStats.find(s => s.sensor_id === sensor.sensor_id);

            console.log("obj.id:", obj.id);
            console.log("sensor:", sensor);
            console.log("stats:", stats);
            console.log("period:", period);

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
                    fill={getCircleColor(period, sensor, sensorStats, statsLoading)}
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