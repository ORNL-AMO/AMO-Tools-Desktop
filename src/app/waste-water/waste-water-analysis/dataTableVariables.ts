
export interface DataTableVariable {
    name: string,
    label: string,
    metricUnit: string,
    imperialUnit: string,
    selected: boolean
}

export const DataTableVariables: Array<DataTableVariable> = [
{
    name: 'MLSS',
    label: 'MLSS Concentration',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: true
},{
    // S - 'soluble' e - 'effluent' 
    name: 'Se',
    label: 'Effluent CBOD5 Concentration (S&#8337;)',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: true
}, {
    name: 'HeterBio',
    label: 'Heterotrophic Biomass Concentration',
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
    label: 'O&#x2082; Required for CBOD Removal',
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
    label: 'Nitrogren Removed in Cell Mass',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: false
}, {
    name: 'NitO2Dem',
    label: 'O&#x2082; demand due to nitrification',
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
    label: 'Effluent NH&#8323;-N Concentration',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: false
}, {
    name: 'EffNo3N',
    label: 'Effluent NO&#8323;-N Concentration',
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
    label: 'WAS Flow Rate',
    metricUnit: 'm&#x00B3;/day',
    imperialUnit: 'MGD',
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
    label: 'RAS Flow Rate',
    metricUnit: 'm&#x00B3;/day',
    imperialUnit: 'MGD',
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