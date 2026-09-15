export function formatTransportDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시 ${minutes % 60}분`;
}
