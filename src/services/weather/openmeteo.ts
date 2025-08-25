// src/services/weather/openmeteo.ts
import type { WeatherPack, HourPoint, Condition } from "@/types/weather";

const mapCond = (code: number): Condition => {
    // mapping rapido WMO -> nostre label
    if ([0].includes(code)) return 'Clear';
    if ([1, 2].includes(code)) return 'PartlyCloudy';
    if ([3].includes(code)) return 'Cloudy';
    if ([45, 48].includes(code)) return 'Fog';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Rain';
    if ([71, 73, 75, 85, 86].includes(code)) return 'Snow';
    if ([95, 96, 99].includes(code)) return 'Thunder';
    return 'Cloudy';
};

export async function getForecastOpenMeteo(lat: number, lon: number): Promise<WeatherPack> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,precipitation_probability,relative_humidity_2m,wind_gusts_10m,uv_index,weather_code&current=temperature_2m,relative_humidity_2m,wind_gusts_10m,uv_index,weather_code,precipitation&forecast_days=3&timezone=auto`;
    const res = await fetch(url);
    const j = await res.json();

    const hours: HourPoint[] = j.hourly.time.map((iso: string, i: number) => ({
        t: Date.parse(iso),
        temp: j.hourly.temperature_2m[i],
        precipMm: j.hourly.precipitation[i],
        precipProb: j.hourly.precipitation_probability?.[i],
        windGust: j.hourly.wind_gusts_10m[i],
        humidity: j.hourly.relative_humidity_2m[i],
        uv: j.hourly.uv_index?.[i],
        cond: mapCond(j.hourly.weather_code[i])
    }));

    const nowIdx = hours.findIndex(h => Math.abs(h.t - Date.now()) < 60 * 60 * 1000) || 0;
    return {
        now: {
            temp: j.current.temperature_2m,
            humidity: j.current.relative_humidity_2m,
            windGust: j.current.wind_gusts_10m,
            uv: j.current.uv_index,
            cond: mapCond(j.current.weather_code),
            precipMm1h: j.current.precipitation
        },
        hours,
    };
}