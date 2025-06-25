import { AirLeakSurveyData } from "../../shared/models/standalone";

export const standardSizesConstant: Array<{ size: string, display: string }> = [
    {
        size: 'CUSTOM',
        display: 'Use Custom Size'
    },
    {
        size: 'oneHalf',
        display: '1/2'
    },
    {
        size: 'threeFourths',
        display: '3/4'
    },
    {
        size: 'one',
        display: '1'
    },
    {
        size: 'oneAndOneFourth',
        display: '1 1/4'
    },
    {
        size: 'oneAndOneHalf',
        display: '1 1/2'
    },
    {
        size: 'two',
        display: '2'
    },
    {
        size: 'twoAndOneHalf',
        display: '2 1/2'
    },
    {
        size: 'three',
        display: '3'
    },
    {
        size: 'threeAndOneHalf',
        display: '3 1/2'
    },
    {
        size: 'four',
        display: '4'
    },
    {
        size: 'five',
        display: '5'
    },
    {
        size: 'six',
        display: '6'
    },
    {
        size: 'eight',
        display: '8'
    },
    {
        size: 'ten',
        display: '10'
    },
    {
        size: 'twelve',
        display: '12'
    },
    {
        size: 'fourteen',
        display: '14'
    },
    {
        size: 'sixteen',
        display: '16'
    },
    {
        size: 'eighteen',
        display: '18'
    },
    {
        size: 'twenty',
        display: '20'
    },
    {
        size: 'twentyFour',
        display: '24'
    },
];

export const metricSizesConstant: Array<{ size: string, display: string }> = [
    {
        size: 'CUSTOM',
        display: 'Use Custom Size'
    },
    {
        size: 'oneHalf',
        display: '15'
    },
    {
        size: 'threeFourths',
        display: '20'
    },
    {
        size: 'one',
        display: '25'
    },
    {
        size: 'oneAndOneFourth',
        display: '32'
    },
    {
        size: 'oneAndOneHalf',
        display: '40'
    },
    {
        size: 'two',
        display: '50'
    },
    {
        size: 'twoAndOneHalf',
        display: '65'
    },
    {
        size: 'three',
        display: '80'
    },
    {
        size: 'threeAndOneHalf',
        display: '90'
    },
    {
        size: 'four',
        display: '100'
    },
    {
        size: 'five',
        display: '125'
    },
    {
        size: 'six',
        display: '150'
    },
    {
        size: 'eight',
        display: '200'
    },
    {
        size: 'ten',
        display: '250'
    },
    {
        size: 'twelve',
        display: '300'
    },
    {
        size: 'fourteen',
        display: '350'
    },
    {
        size: 'sixteen',
        display: '400'
    },
    {
        size: 'eighteen',
        display: '450'
    },
    {
        size: 'twenty',
        display: '500'
    },
    {
        size: 'twentyFour',
        display: '600'
    },
];

export const cagiConditionsImperial  = {
    standardAtmosphericPressure: 14.5,
    standardAmbientTemperature: 68,
    standardRelativeHumidity: 0
}
export const cagiConditionsMetric = {
    standardAtmosphericPressure: 99.97,
    standardAmbientTemperature: 20,
    standardRelativeHumidity: 0
}

export const exampleLeakInputs: Array<AirLeakSurveyData> = [
  {
    name: 'Bag Leak',
    leakDescription: "Enter notes about the leak here.",
    selected: false,
    measurementMethod: 2,
    estimateMethodData: {
      leakRateEstimate: 0
    },
    bagMethodData: {
      operatingTime: 8760,
      bagVolume: .6817,
      bagFillTime: 12,
      numberOfUnits: 1
    },
    decibelsMethodData: {
      linePressure: 0,
      decibels: 0,
      decibelRatingA: 0,
      pressureA: 0,
      firstFlowA: 0,
      secondFlowA: 0,
      decibelRatingB: 0,
      pressureB: 0,
      firstFlowB: 0,
      secondFlowB: 0
    },
    orificeMethodData: {
      compressorAirTemp: 0,
      atmosphericPressure: 0,
      dischargeCoefficient: 0,
      orificeDiameter: 0,
      supplyPressure: 0,
      numberOfOrifices: 0,
    },
    units: 1
  },
 {
    name: 'Estimate Leak',
    leakDescription: "Enter notes about the leak here.",
    selected: false,
    measurementMethod: 0,
    estimateMethodData: {
      leakRateEstimate: .1
    },
   bagMethodData: {
      operatingTime: 0,
      bagVolume: 0,
      bagFillTime: 0,
      numberOfUnits: 0
    },
    decibelsMethodData: {
      linePressure: 0,
      decibels: 0,
      decibelRatingA: 0,
      pressureA: 0,
      firstFlowA: 0,
      secondFlowA: 0,
      decibelRatingB: 0,
      pressureB: 0,
      firstFlowB: 0,
      secondFlowB: 0
    },
    orificeMethodData: {
      compressorAirTemp: 0,
      atmosphericPressure: 0,
      dischargeCoefficient: 0,
      orificeDiameter: 0,
      supplyPressure: 0,
      numberOfOrifices: 0,
    },
    units: 1
  },
 {
    name: 'Orifice Leak',
    leakDescription: "Enter notes about the leak here.",
    selected: false,
    measurementMethod: 3,
    bagMethodData: {
      operatingTime: 0,
      bagVolume: 0,
      bagFillTime: 0,
      numberOfUnits: 0
    },
    estimateMethodData: {
      leakRateEstimate: 0
    },
    decibelsMethodData: {
      linePressure: 0,
      decibels: 0,
      decibelRatingA: 0,
      pressureA: 0,
      firstFlowA: 0,
      secondFlowA: 0,
      decibelRatingB: 0,
      pressureB: 0,
      firstFlowB: 0,
      secondFlowB: 0
    },
    orificeMethodData: {
      compressorAirTemp: 250,
      atmosphericPressure: 14.7,
      dischargeCoefficient: 0.97,
      orificeDiameter: 0.375,
      supplyPressure: 115,
      numberOfOrifices: 4,
    },
    units: 1
  }, {
    name: 'Decibel leak',
    leakDescription: "Enter notes about the leak here.",
    selected: false,
    measurementMethod: 1,
    estimateMethodData: {
      leakRateEstimate: 0
    },
    bagMethodData: {
      operatingTime: 0,
      bagVolume: 0,
      bagFillTime: 0,
      numberOfUnits: 0
    },
    decibelsMethodData: {
      linePressure: 130,
      decibels: 25,
      decibelRatingA: 20,
      pressureA: 150,
      firstFlowA: 1.4,
      secondFlowA: 1.2,
      decibelRatingB: 30,
      pressureB: 125,
      firstFlowB: 1.85,
      secondFlowB: 1.65
    },
    orificeMethodData: {
      compressorAirTemp: 0,
      atmosphericPressure: 0,
      dischargeCoefficient: 0,
      orificeDiameter: 0,
      supplyPressure: 0,
      numberOfOrifices: 0,
    },
    units: 1
  }
];
