import React, { useEffect, useState } from "react";
import CentralHub from "./CentralHub";
import OrbitingNodes from "./OrbitingNodes";
import SVGArcsLayer from "./SVGArcsLayer";

// Premium Circular Strategy Map
const CircularStrategyMap = ({
  directions,
  getDisplayDirection,
  t,
  className = "",
}) => {
  const center = 400;

  // Responsive layout configuration
  const [layoutConfig, setLayoutConfig] = useState({
    radiusMain: 160,
    radiusOuter: 280,
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1536) {
        // 2xl screens
        setLayoutConfig({ radiusMain: 200, radiusOuter: 380 });
      } else if (window.innerWidth >= 1280) {
        // xl screens
        setLayoutConfig({ radiusMain: 180, radiusOuter: 340 });
      } else {
        // lg screens
        setLayoutConfig({ radiusMain: 160, radiusOuter: 280 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { radiusMain, radiusOuter } = layoutConfig;

  const getPos = (angleDeg, r) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: center + Math.cos(angleRad) * r,
      y: center + Math.sin(angleRad) * r,
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = getPos(endAngle, radius);
    const end = getPos(startAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
  };

  return (
    <div
      className={`relative w-[800px] h-[800px] mx-auto flex items-center justify-center select-none scale-[0.45] md:scale-[0.55] lg:scale-[0.65] xl:scale-[0.75] 2xl:scale-[0.9] transition-transform ${className}`}
    >
      {/* Ambient glow layers */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#887CFD]/20 blur-[100px] rounded-full animate-pulse" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#16C8C7]/20 blur-[80px] rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* SVG Layer */}
      <SVGArcsLayer
        directions={directions}
        center={center}
        radiusMain={radiusMain}
        radiusOuter={radiusOuter}
        getPos={getPos}
        describeArc={describeArc}
      />

      {/* Premium Central Hub */}
      <CentralHub t={t} />

      {/* Orbiting Nodes */}
      <OrbitingNodes
        directions={directions}
        getDisplayDirection={getDisplayDirection}
        t={t}
        radiusOuter={radiusOuter}
        center={center}
        getPos={getPos}
      />
    </div>
  );
};

export default CircularStrategyMap;
