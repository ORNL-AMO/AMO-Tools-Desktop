
export interface DataTableVariable {
    name: string,
    label: string,
    metricUnit: string,
    imperialUnit: string,
    selected: boolean
}

export const DataTableVariables: Array<DataTableVariable> = [{
    // S - 'soluble' e - 'effluent' 
    name: 'Se',
    label: 'Effluent CBOD5 Concentration (S&#8337;)',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: true
}, {
    name: 'HeterBio',
    label: 'Heterotrophic biomass concentration',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: false
}, {
    name: 'CellDeb',
    label: 'Cell Debris Concentration',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: false
}, {
    name: 'InterVes',
    label: 'Influent Inert VSS Concentration',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: false
}, {
    name: 'MLVSS',
    label: 'MLVSS Concentration',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: true
}, {
    name: 'MLSS',
    label: 'MLSS Concentration',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: true
}, {
    name: 'BiomassProd',
    label: 'Biomass Production VSS',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: false
}, {
    name: 'SludgeProd',
    label: 'Sludge Production VSS',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: true
}, {
    name: 'SolidProd',
    label: 'Total Solids Production TSS',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: true
}, {
    name: 'Effluent',
    label: 'Effluent TSS',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: false
}, {
    name: 'InertWaste',
    label: 'Inert Waste TSS',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: false
}, {
    name: 'OxygenRqd',
    label: 'Oxygen Required for CBOD Removal',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: false
}, 
// {
//     name: 'FlowMgd',
//     label: 'FlowMgd',
//     metricUnit: 'mgd',
//     imperialUnit: 'm&#x00B3;/day',
//     selected: false
// }, 
{
    name: 'NRemoved',
    label: 'Nitrogen Removed',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: false
}, {
    name: 'NRemovedMgl',
    label: 'N2 Removed',
    metricUnit: 'mgl',
    imperialUnit: 'mgl',
    selected: false
}, {
    name: 'NitO2Dem',
    label: 'Oxygen demand due to nitrification',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: false
}, {
    name: 'O2Reqd',
    label: 'Total O&#x2082; Requirements',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: true
}, {
    name: 'EffNH3N',
    label: 'Effluent NH&#x00B3;-N Concentration',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: false
}, {
    name: 'EffNo3N',
    label: 'Effluent NO&#x00B3;-N Concentration',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: false
}, {
    name: 'TotalO2Rqd',
    label: 'O&#x2082; Requirements with denitrification savings',
    metricUnit: 'kg/day',
    imperialUnit: 'lb/day',
    selected: false
}, {
    name: 'WAS',
    label: 'WAS Flow',
    metricUnit: 'm&#x00B3;/day',
    imperialUnit: 'mgd',
    selected: false
}, {
    // Total Effluent - soluable and insoluble
    name: 'EstimatedEff',
    label: 'Total Effluent CBOD5',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: true
}, {
    name: 'EstimRas',
    label: 'Ras Flow Rate',
    metricUnit: 'm&#x00B3;/day',
    imperialUnit: 'mgd',
    selected: false
}, {
    name: 'FmRatio',
    label: 'F/M Ratio',
    metricUnit: '1/day',
    imperialUnit: '1/day',
    selected: false
}, 
// {
//     name: 'Diff_MLSS',
//     label: 'Diff_MLSS',
//     metricUnit: '',
//     imperialUnit: '',
//     selected: false
// }
]