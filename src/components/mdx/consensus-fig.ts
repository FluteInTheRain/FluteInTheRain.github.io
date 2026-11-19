// Small helpers shared by the Consensus* figures added for this post.
export function head(x1: number, y1: number, x2: number, y2: number, l = 8): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p1 = [x2 - l * Math.cos(a - 0.45), y2 - l * Math.sin(a - 0.45)];
  const p2 = [x2 - l * Math.cos(a + 0.45), y2 - l * Math.sin(a + 0.45)];
  return `${x2},${y2} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
}
