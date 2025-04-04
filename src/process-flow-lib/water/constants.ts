import { CSSProperties } from "react";
import { WaterProcessComponentType } from "./types/diagram";

export const waterTreatmentTypeOptions: {value: number, display: string}[] = [
    {value: 0, display: 'Sand Filtration'},
    {value: 1, display: 'Bag Filtration'},
    {value: 2, display: 'Cartridge Filtration'},
    {value: 3, display: 'Chemical Treatment of Cooling Tower Makeup Water'},
    {value: 4, display: 'Sand Granular Activated Carbon Absorption (GAC)'},
    {value: 5, display: 'Chlorination'},
    {value: 6, display: 'Ozonization'},
    {value: 7, display: 'UV Filtration'},
    {value: 8, display: 'Ion Exchange Softening'},
    {value: 9, display: 'Lime Softening'},
    {value: 10, display: 'Membrane Filtration'},
    {value: 11, display: 'Microfiltration'},
    {value: 12, display: 'Ultrafiltration'},
    {value: 13, display: 'Reverse Osmosis'},
    {value: 14, display: 'NanoFiltration'},
    {value: 15, display: 'Other'},
]


export const wasteWaterTreatmentTypeOptions: {value: number, display: string}[] = [
    {value: 0, display: 'Screening and Grit Removal'},
    {value: 1, display: 'Flow Equalization'},
    {value: 2, display: 'Oil/Water Separation'},
    {value: 3, display: 'Neutralization'},
    {value: 4, display: 'Coagulation/Flocculation'},
    {value: 5, display: 'Clarification (Settling, Sedimentation)'},
    {value: 6, display: 'Flotation'},
    {value: 7, display: 'Dissolved Air Flotation'},
    {value: 8, display: 'Membrane Bioreactor (MBR)'},
    {value: 9, display: 'Activated Sludge / Aerobic Lagoon'},
    {value: 10, display: 'Anaerobic Lagoon'},
    {value: 11, display: 'Trickling Filter'},
    {value: 12, display: 'Biological Nutrient Removal (BNR)'},
    {value: 13, display: 'Sand Filtration'},
    {value: 14, display: 'Alkaline Chlorination'},
    {value: 15, display: 'Other'},
]

export const MAX_FLOW_DECIMALS = 3;

export const flowDecimalPrecisionOptions: {value: number | string, display: string}[] = [
    {value: 0, display: '0'},
    {value: 1, display: '1 Place'},
    {value: 2, display: '2 Places'},
    {value: MAX_FLOW_DECIMALS, display: '3 Places'},
];


export const waterUsingSystemTypeOptions: {value: number, display: string}[] = [
    {value: 0, display: 'Process Use'},
    {value: 1, display: 'Cooling Tower'},
    {value: 2, display: 'Boiler Water'},
    {value: 3, display: 'Kitchen and Restroom'},
    {value: 4, display: 'Landscaping and Irrigation'},
]

export const intakeSourceTypeOptions: {value: number, display: string}[] = [
    {value: 0, display: 'Municipal Water (Potable)'},
    {value: 1, display: 'Municipal Water (Non-potable)'},
    {value: 2, display: 'Municipal Water'},
    {value: 3, display: 'River or Lake (Non-Potable)'},
    {value: 4, display: 'Ocean or Tide'},
    {value: 5, display: 'Groundwater'},
    {value: 6, display: 'Other'},
]


export const dischargeOutletTypeOptions: {value: number, display: string}[] = [
    {value: 0, display: 'Municipal Sewer'},
    {value: 1, display: 'Third-party Disposal'},
    {value: 2, display: 'River or Lake'},
    {value: 3, display: 'Ocean or Tide'},
    {value: 4, display: 'Groundwater'},
    {value: 5, display: 'Onsite Disposal'},
    // Water not used in any processes
    {value: 6, display: 'Stormwater to Municipal Sewer'},
]

export const waterFlowMetricOptions: {value: number, display: string}[] = [
    {value: 0, display: 'Annual Flow'},
    {value: 1, display: 'Hourly Flow'},
    {value: 2, display: 'Water Intensity'},
    {value: 3, display: 'Fraction of Gross Water Use'},
    {value: 4, display: 'Fraction of Incoming Water'},
]


export enum FlowMetric {
    ANNUAL = 0,
    HOURLY = 1,
    INTENSITY = 2,
    FRACTION_GROSS = 3,
    FRACTION_INCOMING = 4
}

export const ImperialFlowUnitMap: Record<FlowMetric, WaterUseUnit> = {
    [FlowMetric.ANNUAL]: 'gal',
    [FlowMetric.HOURLY]: 'gal/hr',
    [FlowMetric.INTENSITY]: 'gal/unit',
    [FlowMetric.FRACTION_GROSS]: undefined,
    [FlowMetric.FRACTION_INCOMING]: undefined,
  };

export const MetricFlowUnitMap: Record<FlowMetric, WaterUseUnit> = {
    [FlowMetric.ANNUAL]: 'm<sup>3</sup>',
    [FlowMetric.HOURLY]: 'm<sup>3</sup>/hr',
    [FlowMetric.INTENSITY]: 'm<sup>3</sup>/unit',
    [FlowMetric.FRACTION_GROSS]: undefined,
    [FlowMetric.FRACTION_INCOMING]: undefined,
  };

export const conductivityUnitOptions: {value: string, display: string}[] = [
    {value: 'mmho', display: 'mmho'},
    {value: 'TDS ppm', display: 'TDS ppm'},
    {value: 'MuS/cm', display: 'MuS/cm'},
    {value: 'mS/cm', display: 'mS/cm'},
]
export type WaterUseUnit = undefined | 'gal' | 'gal/hr' | 'gal/unit' | 'm<sup>3</sup>' | 'm<sup>3</sup>/hr' | 'm<sup>3</sup>/unit' ;

export const CustomNodeStyleMap: Record<WaterProcessComponentType, CSSProperties> = {
  'water-intake': {
    backgroundColor: '#75a1ff',
    color: "#ffffff"
  },
  'water-discharge': {
    backgroundColor: '#7f7fff',
    color: "#ffffff"
  },
  'water-using-system': {
    backgroundColor: '#00bbff',
    color: "#ffffff"
  },
  'summing-node': {
    // backgroundColor: '#75a1ff',
    // color: "#ffffff"
  },
  'water-treatment': {
    backgroundColor: '#009386',
    color: "#ffffff"
  },
  'waste-water-treatment': {
    backgroundColor: '#93e200',
    color: "#000"
  },
  'known-loss': {
    backgroundColor: '#fff',
    color: "#000"
  }
};
