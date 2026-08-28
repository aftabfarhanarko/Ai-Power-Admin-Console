import { motion } from "framer-motion";
import { priorityConfig } from "./constants";

// SVG Arcs Layer Component
const SVGArcsLayer = ({ directions, center, radiusMain, radiusOuter, getPos, describeArc }) => {
  const total = directions.length;

  const drawVariant = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          delay: i * 0.25,
          type: "spring",
          duration: 2,
          bounce: 0,
        },
        opacity: { delay: i * 0.25, duration: 0.3 },
      },
    }),
  };

  return (
    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
      <defs>
        {/* Premium gradient for arrows */}
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#887CFD" />
          <stop offset="100%" stopColor="#6f63e3" />
        </linearGradient>

        {/* Arrow marker */}
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="url(#arrowGradient)" />
        </marker>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Multi-layered inner rings */}
      <motion.circle
        cx={center}
        cy={center}
        r={120}
        fill="none"
        stroke="#887CFD"
        strokeWidth="0.5"
        strokeDasharray="3 3"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.2, scale: 1, rotate: 360 }}
        transition={{
          opacity: { duration: 1.5 },
          scale: { duration: 1.5, type: "spring" },
          rotate: { duration: 80, repeat: Infinity, ease: "linear" },
        }}
      />

      <motion.circle
        cx={center}
        cy={center}
        r={140}
        fill="none"
        stroke="#887CFD"
        strokeWidth="1"
        strokeDasharray="5 5"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.3, scale: 1, rotate: -360 }}
        transition={{
          opacity: { duration: 1.5 },
          scale: { duration: 1.5, type: "spring" },
          rotate: { duration: 100, repeat: Infinity, ease: "linear" },
        }}
      />

      {/* Enhanced Segments & Connectors */}
      {directions.map((dir, index) => {
        const priority = (dir?.priority || "medium").toLowerCase();
        const config = priorityConfig[priority] || priorityConfig.medium;

        const angleStep = 360 / total;
        const startAngle = index * angleStep - 90;
        const endAngle = startAngle + angleStep - 15;

        const arcPath = describeArc(
          center,
          center,
          radiusMain,
          startAngle + 5,
          endAngle,
        );

        const nodeAngle = startAngle + angleStep / 2;
        const ringPos = getPos(nodeAngle, radiusMain);
        const outerPos = getPos(nodeAngle, radiusOuter);

        return (
          <g key={index}>
            {/* Glow layer for arc */}
            <motion.path
              d={arcPath}
              fill="none"
              stroke={config.color}
              strokeWidth="10"
              opacity="0.15"
              filter="url(#glow)"
              custom={index}
              variants={drawVariant}
              initial="hidden"
              animate="visible"
            />

            {/* Main arc segment with gradient */}
            <motion.path
              d={arcPath}
              fill="none"
              stroke="url(#arrowGradient)"
              strokeWidth="7"
              markerEnd="url(#arrow)"
              className="opacity-90"
              custom={index}
              variants={drawVariant}
              initial="hidden"
              animate="visible"
            />

            {/* Connector line with glow */}
            <motion.line
              x1={ringPos.x}
              y1={ringPos.y}
              x2={outerPos.x}
              y2={outerPos.y}
              stroke={config.color}
              strokeWidth="3"
              opacity="0.4"
              custom={index}
              variants={drawVariant}
              initial="hidden"
              animate="visible"
            />

            <motion.line
              x1={ringPos.x}
              y1={ringPos.y}
              x2={outerPos.x}
              y2={outerPos.y}
              stroke="url(#arrowGradient)"
              strokeWidth="5"
              custom={index}
              variants={drawVariant}
              initial="hidden"
              animate="visible"
            />

            {/* Enhanced ring connection point */}
            <motion.circle
              cx={ringPos.x}
              cy={ringPos.y}
              r="8"
              fill="white"
              stroke="url(#arrowGradient)"
              strokeWidth="4"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.25 + 0.8, type: "spring" }}
            />

            <motion.circle
              cx={ringPos.x}
              cy={ringPos.y}
              r="4"
              fill="url(#arrowGradient)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.25 + 1, type: "spring" }}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default SVGArcsLayer;
