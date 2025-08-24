import React from 'react';
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiThunderstorm, WiFog } from 'react-icons/wi';
import { BsGeoAlt } from "react-icons/bs";

const GeoIcon = BsGeoAlt as React.FC<{ size?: number }>;

type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'fog';

interface MeteoProps {
    temperature: number;
    weather: WeatherType;
    location?: string;
}

const weatherIcons: Record<WeatherType, React.ReactNode> = {
    sunny: <WiDaySunny size={180} color="#fbbf24" />,
    cloudy: <WiCloud size={180} color="#64748b" />,
    rain: <WiRain size={180} color="#38bdf8" />,
    snow: <WiSnow size={180} color="#a3e635" />,
    thunderstorm: <WiThunderstorm size={180} color="#f87171" />,
    fog: <WiFog size={180} color="#94a3b8" />,
};

const weatherLabels: Record<WeatherType, string> = {
    sunny: 'Soleggiato',
    cloudy: 'Nuvoloso',
    rain: 'Pioggia',
    snow: 'Neve',
    thunderstorm: 'Temporale',
    fog: 'Nebbia',
};

const Weather: React.FC<MeteoProps> = ({ temperature, weather, location }) => (
    <div className="flex px-6 justify-between items-center">
        <div className='flex flex-col gap-2'>
            <div className="flex items-center gap-2">
                <GeoIcon size={25} />
                {location && (
                    <div className='text-sm text-gray-300'>
                        {location}
                    </div>
                )}
            </div>
            <p className="text-6xl font-semibold">{temperature}°C</p>
            <div className='text-xs text-gray-400'>
                <p>{new Date().toLocaleDateString("it-IT", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })}</p>
                <p>{new Date().toLocaleTimeString()}</p>
            </div>
        </div>
        {weatherIcons[weather]}
    </div>

);

export default Weather;