export function getSlopeFromPoints({ x: x1, y: y1 }, { x: x2, y: y2 }) {
  return (y2 - y1) / (x2 - x1);
}

export function getInterceptFromPoints({ x: x1, y: y1 }, { x: x2, y: y2 }) {
  const slope = getSlopeFromPoints({ x: x1, y: y1 }, { x: x2, y: y2 });
  return y1 - slope * x1;
}

export function getInterceptFromSlopeAndPoint(slope, { x, y }) {
  return y - slope * x;
}
