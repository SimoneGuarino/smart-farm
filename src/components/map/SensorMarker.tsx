import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const pin = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconAnchor: [12, 41],
    popupAnchor: [0, -28],
});

export default function SensorMarker({ id, pos }: { id: string; pos: [number, number] }) {
    return (
        <Marker position={pos} icon={pin}>
            <Popup>
                <div className="text-sm">
                    <div className="font-medium">{id}</div>
                    <div className="opacity-70">Stato: OK</div>
                </div>
            </Popup>
        </Marker>
    );
}
