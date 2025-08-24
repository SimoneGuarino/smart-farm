import { Polygon } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

/** Copre tutta la mappa e crea "buchi" sui poligoni passati (fillRule evenodd). */
export default function MapMask({ holes }: { holes: LatLngExpression[][] }) {
    // anello esterno enorme (quasi il mondo intero)
    const WORLD: LatLngExpression[] = [
        [-85, -180], [85, -180], [85, 180], [-85, 180],
    ];
    // Polygon con anello esterno + "fori" (i tuoi terreni)
    return (
        <Polygon
            positions={[WORLD, ...holes] as unknown as LatLngExpression[][]}
            pathOptions={{
                fillColor: "rgba(0, 0, 0, 1)",
                fillOpacity: 0.5,
                stroke: false,
                fillRule: "evenodd",
            }}
        />
    );
}
