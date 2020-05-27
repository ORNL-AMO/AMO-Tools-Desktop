export interface AirFlowConversionInput {
    elevation: number;
    userDefinedPressure: boolean;
    actualAtmosphericPressure: number;
    actualAmbientTemperature: number;
    actualRelativeHumidity: number;
    acfm: number;
    scfm: number;
    convertToStandard: boolean;
    standardAtmosphericPressure: number;
    standardAmbientTemperature: number;
    standardRelativeHumidity: number;
    actualSaturatedVaporPressure: number;
    standardSaturatedVaporPressure: number;
}

export interface AirFlowConversionOutput {
    acfm: number;
    scfm: number;
}