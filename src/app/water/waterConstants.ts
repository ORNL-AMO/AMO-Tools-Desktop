
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

export const waterUsingSystemTypeOptions: {value: number, display: string}[] = [
    {value: 0, display: 'Process Use'},
    {value: 1, display: 'Cooling Tower'},
    {value: 2, display: 'Boiler Water'},
    {value: 3, display: 'Kitchen and Restroom'},
    {value: 4, display: 'Landscaping and Irrigation'},
]

export const waterFlowMetricOptions: {value: number, display: string}[] = [
    {value: 0, display: 'Annual Flow'},
    {value: 1, display: 'Hourly Flow'},
    {value: 2, display: 'Water Intensity'},
    {value: 3, display: 'Fraction of Gross Water Use'},
    {value: 4, display: 'Fraction of Incoming Water'},
]


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
    {value: 5, display: 'Clarification (Settling, Sedimentation'},
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
