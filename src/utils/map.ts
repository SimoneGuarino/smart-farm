export type Pair = [number, number]

/** Converte una coppia in LatLng, auto-detectando se è [lng,lat] o [lat,lng] */
export function toLLAuto(pair: Pair): google.maps.LatLngLiteral {
  const [a, b] = pair
  // Se il primo valore sembra una latitudine valida (|lat|<=90) e il secondo sembra una longitudine (|lng|<=180),
  // assumiamo [lat, lng]. Altrimenti invertiamo.
  const looksLatLng = Math.abs(a) <= 90 && Math.abs(b) <= 180
  const lat = looksLatLng ? a : b
  const lng = looksLatLng ? b : a
  return { lat, lng }
}

/** Restituisce paths per <Polygon>, supportando:
 * - poligono semplice: number[][]
 * - poligono con fori: number[][][]
 * - multipoligono: number[][][][]  (se necessario lo "appiattiamo" in più anelli)
 */
export function normalizePaths(poly: any): google.maps.LatLngLiteral[] | google.maps.LatLngLiteral[][] {
  // poly = [[x,y], [x,y], ...]             -> 1 anello
  // poly = [ [[x,y]...], [[x,y]...] ]      -> più anelli (fori)
  const first = poly?.[0]
  const isRing = Array.isArray(first) && typeof first[0] === 'number'
  const isMultiRing = Array.isArray(first) && Array.isArray(first[0])

  if (isRing) {
    return (poly as Pair[]).map(toLLAuto)
  }
  if (isMultiRing) {
    return (poly as Pair[][]).map(ring => ring.map(toLLAuto))
  }
  // fallback: prova ad appiattire un livello
  return (poly as Pair[][]).flat().map(toLLAuto)
}