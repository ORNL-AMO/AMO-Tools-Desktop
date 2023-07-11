export const pumpTypesConstant: Array<{ value: number, display: string }> = [
    {
        value: 0,
        display: 'End Suction Slurry'
    },
    {
        value: 1,
        display: 'End Suction Sewage'
    },
    {
        value: 2,
        display: 'End Suction Stock'
    },
    {
        value: 3,
        display: 'End Suction Submersible Sewage'
    },
    {
        value: 4,
        display: 'API Double Suction'
    },
    {
        value: 5,
        display: 'Multistage Boiler Feed'
    },
    {
        value: 6,
        display: 'End Suction ANSI/API'
    },
    {
        value: 7,
        display: 'Axial Flow'
    },
    {
        value: 8,
        display: 'Double Suction'
    },
    {
        value: 9,
        display: 'Vertical Turbine'
    },
    {
        value: 10,
        display: 'Large End Suction'
    },
    {
        value: 11,
        display: 'Specified Optimal Efficiency'
    },
    { value: 12, display: 'Direct Drive' },
    { value: 13, display: 'Belt Drive' },
    { value: 14, display: 'Gear Box/Transmission' }, 
    // When user selects below they need a way to provide the optimal efficiency
    // 'Specified Optimal Efficiency'
];

export const driveConstants: Array<{ value: number, display: string }> = [
    {
        value: 0,
        display: 'Direct Drive'
    },
    {
        value: 1,
        display: 'V-Belt Drive'
    },
    {
        value: 2,
        display: 'Notched V-Belt Drive'
    },
    {
        value: 3,
        display: 'Synchronous Belt Drive'
    },
    {
        value: 4,
        display: 'Specified Efficiency'
    }
];

export const fluidProperties = {
    'Acetone': { beta: 0.00079, tref: 77, density: 49, kinViscosity: 0.41, boiling: 132.89, melting: -138.5 },
    'Ammonia': { beta: 0.00136, tref: 77, density: 51.4, kinViscosity: 0.3, boiling: -28.01, melting: -107.91 },
    'Dichlorodifluoromethane refrigerant R-12': { beta: 0.00144, tref: 77, density: 81.8, kinViscosity: 0.198, boiling: -21.6, melting: -251.9 },
    'Ethanol': { beta: 0.00061, tref: 77, density: 49, kinViscosity: 1.52, boiling: 172.99, melting: -173.5 },
    'Ethylene glycol': { beta: 0.00032, tref: 77, density: 68.5, kinViscosity: 17.8, boiling: 387.1, melting: 8.8 },
    'Gasoline': { beta: 0.00053, tref: 60, density: 46, kinViscosity: 0.88, boiling: 258.9, melting: -70.9 },
    'Glycerine (glycerol)': { beta: 0.00028, tref: 77, density: 78.66, kinViscosity: 648, boiling: 554.0, melting: 64.0 },
    'Kerosene - jet fuel': { beta: 0.00055, tref: 60, density: 51.2, kinViscosity: 2.71, boiling: 572.0, melting: -10 },
    'Methanol': { beta: 0.00083, tref: 77, density: 49.1, kinViscosity: 0.75, boiling: 148.5, melting: -143.7 },
    'n-Octane': { beta: 0.00063, tref: 59, density: 43.6, kinViscosity: 1.266, boiling: 258.9, melting: -70.9 },
    'Petroleum': { beta: 0.00056, tref: 60, density: 44.4, kinViscosity: 0.198, boiling: 258.9, melting: -70.9 }
};

export const fluidTypes: Array<string> = [
    'Acetone',
    'Ammonia',
    'Dichlorodifluoromethane refrigerant R-12',
    'Ethanol',
    'Ethylene glycol',
    'Gasoline',
    'Glycerine (glycerol)',
    'Kerosene - jet fuel',
    'Methanol',
    'n-Octane',
    'Other',
    'Petroleum',
    'Water'
];

export const motorEfficiencyConstants: Array<{ value: number, display: string }> = [
    {
        value: 0,
        display: 'Standard Efficiency'
    },
    {
        value: 1,
        display: 'Energy Efficient'
    },
    {
        value: 2,
        display: 'Premium Efficient'
    },
    {
        value: 3,
        display: 'Specified'
    }
];

export const statusTypes: Array<{value: number, display: string}> = [
    {value: 0, display: 'In service'},
    {value: 1, display: 'Out of service'},
    {value: 2, display: 'Standby'},
    {value: 3, display: 'Spare'},
  ];
  export const priorityTypes: Array<{value: number, display: string}> = [
    {value: 0, display: 'Low'},
    {value: 1, display: 'Medium'},
    {value: 2, display: 'High'},
    {value: 3, display: 'Critical'},
  ];

// Ordered by pumpTypeConstants
export const pumpTypeRanges: Array<{ range: {min: number, max: number}, value: number }> = [
    {
        value: 0,
        range: {min: 100, max: 20000}
    },
    {
        value: 1,
        range: {min: 100, max: 22500}
    },
    {
        value: 2,
        range: {min: 400, max: 22000}
    },
    {
        value: 3,
        range: {min: 100, max: 22500}
    },
    {
        value: 4,
        range: {min: 400, max: 22000}
    },
    {
        value: 5,
        range: {min: 100, max: 4000}
    },
    {
        value: 6,
        range: {min: 10, max: 5000}
    },
    {
        value: 7,
        range: {min: 200, max: 40000}
    },
    {
        value: 8,
        range: {min: 200, max: 100000}
    },
    {
        value: 9,
        range: {min: 200, max: 40000}
    },
    {
        value: 10,
        range: {min: 5000, max: 100000}
    },
    {
        value: 11,
        range: {min: 100, max: 100000}
    }

];