import { Polygon, Tooltip } from "react-leaflet";
import type { TerritoryGeo } from "@/types/geo";

export default function TerritoryPolygon({ t, setSelectedId, handleOpenSummary }: 
{ t: TerritoryGeo, setSelectedId: (id: string) => void, handleOpenSummary: () => void }) {
    const fill = "rgba(253,224,71,.55)"; // giallino (tailwind: yellow-300 / 400 con alpha)
    const stroke = "#f59e0b";                // yellow-500

    return (
        <>
            {/* alone morbido */}
            <Polygon
                positions={t.polygon}
                pathOptions={{ color: stroke, weight: 8, opacity: 0.25, fill: false }}
            />
            {/* bordo+riempimento principale */}
            <Polygon
                positions={t.polygon}
                pathOptions={{ color: stroke, weight: 2, fillColor: fill, fillOpacity: 0.95 }}
                eventHandlers={{
                    click: () => { setSelectedId(t.id); handleOpenSummary(); },
                    mouseover: (e) => (e.target as any).setStyle({ weight: 3 }),
                    mouseout: (e) => (e.target as any).setStyle({ weight: 2 }),
                }}
            >
                {/* Tooltip invariato */}
                <Tooltip opacity={0.95} permanent={false}>
                    <div className="text-xs">
                        <div className="font-semibold">{t.name}</div>
                        <div className="opacity-80">{t.areaHa} ha</div>
                        <div className="mt-1 underline">Apri dettagli →</div>
                    </div>
                </Tooltip>
            </Polygon>
        </>
    );
}
