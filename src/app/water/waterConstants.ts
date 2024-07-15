
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