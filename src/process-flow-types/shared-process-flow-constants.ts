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

