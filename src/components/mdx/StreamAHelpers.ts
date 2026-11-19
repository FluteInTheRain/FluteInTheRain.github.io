// Small geometry helpers shared by the StreamA* figures (polygon arrowheads, no SVG ids).
export function headAt(x2: number, y2: number, a: number) {
  const p1 = [x2 - 8 * Math.cos(a - 0.45), y2 - 8 * Math.sin(a - 0.45)];
  const p2 = [x2 - 8 * Math.cos(a + 0.45), y2 - 8 * Math.sin(a + 0.45)];
  return `${x2},${y2} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
}
export function arrow(x1: number, y1: number, x2: number, y2: number) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return { line: `M ${x1} ${y1} L ${x2 - 6 * Math.cos(a)} ${y2 - 6 * Math.sin(a)}`, head: headAt(x2, y2, a) };
}
// Polyline through points with an arrowhead on the last segment.
export function elbow(pts: [number, number][]) {
  const [px, py] = pts[pts.length - 2];
  const [x2, y2] = pts[pts.length - 1];
  const a = Math.atan2(y2 - py, x2 - px);
  const body = pts.slice(0, -1).map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  return { line: `${body} L ${x2 - 6 * Math.cos(a)} ${y2 - 6 * Math.sin(a)}`, head: headAt(x2, y2, a) };
}
