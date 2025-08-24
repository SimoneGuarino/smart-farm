import { Polygon, Tooltip } from "react-leaflet";
import type { TerritoryGeo } from "@/types/geo";
import { useNavigate } from "react-router-dom";

export default function TerritoryPolygon({ t }: { t: TerritoryGeo }) {
    const nav = useNavigate();
    const fill = "rgba(253, 224, 71, 0.45)"; // giallino (tailwind: yellow-300 / 400 con alpha)
    const stroke = "#f59e0b";                // yellow-500

    return (
        <Polygon
            positions={t.polygon}
            pathOptions={{ color: stroke, weight: 2, fillColor: fill, fillOpacity: 0.85 }}
            eventHandlers={{
                click: () => nav(`/terreni/${t.id}`),
                mouseover: (e) => (e.target as any).setStyle({ weight: 3 }),
                mouseout: (e) => (e.target as any).setStyle({ weight: 2 }),
            }}
        >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                <div className="text-xs">
                    <div className="font-semibold">{t.name}</div>
                    <div className="opacity-80">{t.areaHa} ha</div>
                    <div className="mt-1 underline">Apri dettagli →</div>
                </div>
            </Tooltip>
        </Polygon>
    );
}
