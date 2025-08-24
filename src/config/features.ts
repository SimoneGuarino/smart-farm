export type Features = {
    meteoStation: boolean
    inlinePH: boolean
    flowMeter: boolean
    pressureSensors: boolean
    leafWetness: boolean
    soilTemp: boolean
    lisimeter: boolean
}


export const defaultFeatures: Features = {
    meteoStation: true,
    inlinePH: true,
    flowMeter: true,
    pressureSensors: true,
    leafWetness: true,
    soilTemp: true,
    lisimeter: false,
}