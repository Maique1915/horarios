import React from 'react';

const MapaMentalLink = ({ source, target, selectedNodeId }) => {
  const isSelected = selectedNodeId && (source.id === selectedNodeId || target.id === selectedNodeId);
  const isPrereq = target.id === selectedNodeId; // Source is prereq of selected Target
  const isPostreq = source.id === selectedNodeId; // Target is unlocked by selected Source

  // Constants matching MapaMental.jsx
  const NODE_WIDTH = 300;
  const NODE_HEIGHT = 80;
  const COLUMN_WIDTH = 380;
  const ROW_HEIGHT = 110;

  // Connection Points
  // Source Output (Right Center)
  const sx = source.x + NODE_WIDTH;
  const sy = source.y + (NODE_HEIGHT / 2);

  // Target Input (Left Center)
  const tx = target.x;
  const ty = target.y + (NODE_HEIGHT / 2);

  // Routing Logic ("Manhattan" / Orthogonal)
  // We want to route through "gutters" (vertical gaps between columns) 
  // and "alleys" (horizontal gaps between rows).

  // 1. Exit Source into its Right Gutter
  const gutterX1 = sx + ((COLUMN_WIDTH - NODE_WIDTH) / 2); // Center of gap

  // 2. Decide Horizontal Alley Y
  // If target is effectively on a different visual row, we need to change Y.
  // We should pick an alley that doesn't intersect nodes. Use the space between rows.
  // Alley is at (RowBottom + RowNextTop) / 2.
  // Row Bottom = row_index * ROW_HEIGHT + NODE_HEIGHT
  // Row Next Top = (row_index + 1) * ROW_HEIGHT
  // Gap starts at y + 80, ends at y + 110. Center = y + 95.

  let alleyY;

  // Identify logical row indices
  const sourceRow = Math.round(source.y / ROW_HEIGHT);
  const targetRow = Math.round(target.y / ROW_HEIGHT);

  if (targetRow > sourceRow) {
    // Target is one or more rows below
    // Use the alley immediately below the source row
    alleyY = (sourceRow * ROW_HEIGHT) + NODE_HEIGHT + ((ROW_HEIGHT - NODE_HEIGHT) / 2);
  } else if (targetRow < sourceRow) {
    // Target is above
    // Use the alley immediately above the source row (which is below the previous row)
    alleyY = (sourceRow * ROW_HEIGHT) - ((ROW_HEIGHT - NODE_HEIGHT) / 2);
  } else {
    // Same row
    const isAdjacent = (target.depth - source.depth) === 1;
    if (isAdjacent) {
      alleyY = sy; // Straight line
    } else {
      // If jumping over a column in the same row, we must dip to avoid hitting the node in between
      alleyY = (sourceRow * ROW_HEIGHT) + NODE_HEIGHT + ((ROW_HEIGHT - NODE_HEIGHT) / 2);
    }
  }

  // 3. Enter Target's Left Gutter
  const gutterX2 = tx - ((COLUMN_WIDTH - NODE_WIDTH) / 2);

  // Construct Path with Rounded Corners
  const spacing = 20; // Default desired radius
  let path = "";

  // 1. Direct Horizontal (Same Row AND Adjacent)
  // Check depth difference to ensure we don't cross through a node in between
  if (Math.abs(sy - ty) < 2 && Math.abs(target.depth - source.depth) === 1) {
    path = `M ${sx} ${sy} L ${tx} ${ty}`;
  }
  // 2. Vertical Gutter (Adjacent Columns, Different Row)
  else if (Math.abs(gutterX1 - gutterX2) < 2) {
    const signY = ty > sy ? 1 : -1;
    // Allow dynamic radius to prevent overlap if points are too close
    const r = Math.min(spacing, Math.abs(ty - sy) / 2 - 2);

    // M sx sy -> straight to gutter -> curve down -> straight to target Y -> curve right -> straight to target
    path = `M ${sx} ${sy}
              L ${gutterX1 - r} ${sy}
              Q ${gutterX1} ${sy} ${gutterX1} ${sy + (r * signY)}
              L ${gutterX1} ${ty - (r * signY)}
              Q ${gutterX1} ${ty} ${gutterX1 + r} ${ty}
              L ${tx} ${ty}`;
  }
  // 3. General Orthogonal (Distant Columns)
  else {
    const signY1 = alleyY > sy ? 1 : -1;
    const signX = gutterX2 > gutterX1 ? 1 : -1;
    const signY2 = ty > alleyY ? 1 : -1;

    // Safe Radius calculation
    const r = Math.min(
      spacing,
      Math.abs(gutterX1 - sx) / 2,
      Math.abs(alleyY - sy) / 2,
      Math.abs(gutterX2 - gutterX1) / 2,
      Math.abs(ty - alleyY) / 2,
      Math.abs(tx - gutterX2) / 2
    );

    path = `M ${sx} ${sy} 
              L ${gutterX1 - r} ${sy} 
              Q ${gutterX1} ${sy} ${gutterX1} ${sy + (r * signY1)}
              L ${gutterX1} ${alleyY - (r * signY1)}
              Q ${gutterX1} ${alleyY} ${gutterX1 + (r * signX)} ${alleyY}
              L ${gutterX2 - (r * signX)} ${alleyY}
              Q ${gutterX2} ${alleyY} ${gutterX2} ${alleyY + (r * signY2)}
              L ${gutterX2} ${ty - (r * signY2)}
              Q ${gutterX2} ${ty} ${gutterX2 + r} ${ty}
              L ${tx} ${ty}`;
  }

  // Styles
  let strokeColor = "var(--border-light-dark, #cbd5e1)"; // Default slate-300
  let strokeWidth = "1.5";
  let opacity = "0.4"; // Slightly higher default for visibility
  let zIndex = 0;

  if (isSelected) {
    opacity = "1";
    strokeWidth = "2.5";
    zIndex = 10;

    if (isPrereq) {
      strokeColor = "#3b82f6"; // Blue
    } else if (isPostreq) {
      strokeColor = "#22c55e"; // Green
    }
  }

  return (
    <React.Fragment>
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className={`transition-all duration-300 ease-in-out ${isSelected ? 'stroke-blue-500 dark:stroke-blue-400' : 'stroke-slate-300 dark:stroke-slate-600'}`}
        style={{
          opacity: opacity,
          zIndex: zIndex,
          stroke: isSelected ? (isPrereq ? '#3b82f6' : '#22c55e') : undefined,
          strokeLinejoin: "round",
          strokeLinecap: "round"
        }}
      />
      {isSelected && (
        <React.Fragment>
          <style>
            {`
              @keyframes flowAnimation {
                from { stroke-dashoffset: 20; }
                to { stroke-dashoffset: 0; }
              }
            `}
          </style>
          <path
            d={path}
            fill="none"
            stroke={isPrereq ? '#60a5fa' : '#4ade80'} // Lighter/Brighter color for flow
            strokeWidth="2"
            style={{
              opacity: 0.8,
              zIndex: zIndex + 1,
              strokeLinejoin: "round",
              strokeLinecap: "round",
              strokeDasharray: "4 4",
              animation: "flowAnimation 0.5s linear infinite"
            }}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default MapaMentalLink;
