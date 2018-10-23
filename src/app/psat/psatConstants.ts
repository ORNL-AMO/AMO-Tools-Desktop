export const pumpTypes: Array<string> = [
    'End Suction Slurry',
    'End Suction Sewage',
    'End Suction Stock',
    'End Suction Submersible Sewage',
    'API Double Suction',
    'Multistage Boiler Feed',
    'End Suction ANSI/API',
    'Axial Flow',
    'Double Suction',
    'Vertical Turbine',
    'Large End Suction',
    // When user selects below they need a way to provide the optimal efficiency
    // 'Specified Optimal Efficiency'
];

export const drives: Array<string> = [
    'Direct Drive',
    'V-Belt Drive',
    'Notched V-Belt Drive',
    'Synchronous Belt Drive',
    'Specified Efficiency'
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