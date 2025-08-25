// src/types/weather.ts
export type Condition = 'Clear' | 'Cloudy' | 'Rain' | 'Snow' | 'Fog' | 'PartlyCloudy' | 'Thunder';

export type HourPoint = {
    t: number;          // epoch ms
    temp: number;       // °C
    precipMm: number;   // mm/h
    precipProb?: number;// 0-100
    windGust: number;   // km/h
    humidity: number;   // %
    uv?: number;        // 0-11+
    cond: Condition;
};

export type WeatherPack = {
    now: {
        temp: number; humidity: number; windGust: number; uv?: number;
        cond: Condition; precipMm1h?: number;
    };
    hours: HourPoint[]; // 48–72h
    daily?: { t: number; min: number; max: number; precipMm: number }[];
};