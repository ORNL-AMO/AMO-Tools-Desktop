
export interface DataTableVariable {
    name: string,
    label: string,
    metricUnit: string,
    imperialUnit: string,
    selected: boolean
}

export const DataTableVariables: Array<DataTableVariable> = [{
    name: 'Se',
    label: 'Efffluent CBOD5 Concentration (S&#x2080;)',
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
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
    selected: false
}, {
    name: 'SludgeProd',
    label: 'Sludge Production VSS',
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
    selected: true
}, {
    name: 'SolidProd',
    label: 'T. Solids Production TSS',
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
    selected: true
}, {
    name: 'Effluent',
    label: 'Effluent TSS',
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
    selected: false
}, {
    name: 'IntentWaste',
    label: 'Intent Waste TSS',
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
    selected: false
}, {
    name: 'OxygenRqd',
    label: 'Oxygen Required',
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
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
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
    selected: false
}, {
    name: 'NRemovedMgl',
    label: 'Nitrogen Removed Mgl',
    metricUnit: 'mgl',
    imperialUnit: 'm&#x00B3;',
    selected: false
}, {
    name: 'NitO2Dem',
    label: 'Oxygen demand due to nitrification',
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
    selected: false
}, {
    name: 'O2Reqd',
    label: 'Total O&#x2082; Requirements',
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
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
    metricUnit: 'lb/day',
    imperialUnit: 'kg/day',
    selected: false
}, {
    name: 'WAS',
    label: 'WAS Flow',
    metricUnit: 'mgd',
    imperialUnit: 'm&#x00B3;/day',
    selected: false
}, {
    name: 'EstimatedEff',
    label: 'Effluent CBOD5',
    metricUnit: 'mg/L',
    imperialUnit: 'mg/L',
    selected: false
}, {
    name: 'EstimRas',
    label: 'Ras Flow Rate',
    metricUnit: 'mgd',
    imperialUnit: 'm&#x00B3;/day',
    selected: false
}, {
    name: 'FmRatio',
    label: 'F/M Ratio',
    metricUnit: '',
    imperialUnit: '',
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