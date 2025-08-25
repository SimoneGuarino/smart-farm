// src/components/WeatherPanel.tsx
import type { WeatherPack } from "@/types/weather";
import Card from "@/components/ui/Card";
//icons
import { IoSunnyOutline, IoWaterOutline } from "react-icons/io5";
import { PiWindLight } from "react-icons/pi";

const WaterIcon = IoWaterOutline as React.FC<{ size?: number }>;
const EnergyIcon = IoSunnyOutline as React.FC<{ size?: number }>;
const WindIcon = PiWindLight as React.FC<{ size?: number }>;

export default function WeatherPanel({ data }: { data: WeatherPack }) {
    const now = data.now;
    const hours = data.hours.slice(0, 16); // 16 ore ≈ fascia “hero”
    const noonIdx = hours.findIndex(h => new Date(h.t).getHours() === 12) ?? 6;

    return (
        <div className="relative text-white">
            {/* Titolo + chip condizione */}
            <div className="flex items-center justify-between">
                <div className="flex items-end gap-3">
                    <div className="text-5xl font-semibold leading-none">{Math.round(now.temp)}°</div>
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur">{now.cond}</span>
                </div>
                <div className="text-sm opacity-90">{new Date().toLocaleDateString()}</div>
            </div>

            {/* Barra colore (fascia oraria) */}
            <div className="mt-3">
                <div className="h-4 w-full rounded-full overflow-hidden bg-white/20">
                    <div
                        className="h-full"
                        style={{
                            width: `${(noonIdx / (hours.length - 1)) * 100}%`,
                            background: 'linear-gradient(90deg,#22c55e 0%,#f59e0b 60%,#ef4444 100%)'
                        }}
                    />
                </div>
                <div className="text-xs mt-1 flex justify-between">
                    <span>09 AM</span><span>12 PM</span><span>03 PM</span><span>06 PM</span>
                </div>
            </div>

            {/* Mini cards traslucide */}
            <div className="grid grid-cols-3 gap-3 mt-8">
                <Card className="p-3 bg-white/15 backdrop-blur-md text-white border-transparent">
                    <EnergyIcon size={25} />
                    <div className="text-xs">UV Index</div>
                    <div className="text-2xl">{Math.round(now.uv ?? 0)}</div>
                </Card>
                <Card className="p-3 bg-white/15 backdrop-blur-md text-white border-transparent">
                    <WaterIcon size={25} />
                    <div className="text-xs">Humidity</div>
                    <div className="text-2xl">{Math.round(now.humidity)}%</div>
                </Card>
                <Card className="p-3 bg-white/15 backdrop-blur-md text-white border-transparent">
                    <WindIcon size={25} />
                    <div className="text-xs">Wind</div>
                    <div className="text-2xl">{Math.round(now.windGust)}<span className="text-base"> km/h</span></div>
                </Card>
            </div>
        </div>
    );
}