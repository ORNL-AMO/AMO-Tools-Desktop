export interface OtherFuel {
    energySource: string;
    fuelTypes: Array<{
        fuelType: string,
        outputRate: number
    }>;
}

export const otherFuels: Array<OtherFuel> = [
    {
        energySource: 'Steam & Hot Water',
        fuelTypes: [
            {
                fuelType: 'Steam & Hot Water',
                outputRate: 66.33
            }
        ]

    },
    {
        energySource: 'Natural Gas',
        fuelTypes: [
            {
                fuelType: 'Natural Gas',
                outputRate: 53.06
            }
        ]
    },
    {
        energySource: 'Petroleum-based fuels',
        fuelTypes: [
            {
                fuelType: 'Diesel (Distillate Fuel #2)',
                outputRate: 73.96
            },
            {
                fuelType: 'Motor Gasoline',
                outputRate: 70.22
            },
            {
                fuelType: 'Liquified petroleum gases (LPG)',
                outputRate: 61.71
            },
            {
                fuelType: 'Kerosene',
                outputRate: 75.2
            },
            {
                fuelType: 'Crude Oil',
                outputRate: 74.54
            },
            {
                fuelType: 'Ethane',
                outputRate: 59.6
            },
            {
                fuelType: 'Ethylene',
                outputRate: 65.96
            },
            {
                fuelType: 'Propane',
                outputRate: 62.87
            },
            {
                fuelType: 'Propylene',
                outputRate: 67.77
            },
                      
            {
                fuelType: 'Isobutane',
                outputRate: 64.94
            },
            {
                fuelType: 'Butane',
                outputRate: 64.77
            },
            {
                fuelType: 'Pentanes Plus',
                outputRate: 70.02
            },
            {
                fuelType: 'Distillate Fuel #1',
                outputRate: 73.25
            },
            {
                fuelType: 'Distillate Fuel #4',
                outputRate: 75.04
            },
            {
                fuelType: 'Residual Fuel #5',
                outputRate: 72.93
            },
            {
                fuelType: 'Residual Fuel #6',
                outputRate: 75.1
            },
        ]

    },
    {
        energySource: 'Biomass fuels',
        fuelTypes: [
            {
                fuelType: 'Biodiesel',
                outputRate: 73.84
            },
            {
                fuelType: 'Ethanol',
                outputRate: 68.44
            },
            {
                fuelType: 'Wood',
                outputRate: 93.8
            },
            {
                fuelType: 'Bagasse Pulping Liquor',
                outputRate: 95.5
            },
            {
                fuelType: 'Agricultural Byproduct',
                outputRate: 118.17
            },
            {
                fuelType: 'Landfill Gas',
                outputRate: 52.07,
            }
        ]
    },
    {
        energySource: 'Coal',
        fuelTypes: [
            {
                fuelType: 'Mixed - Industrial Sector',
                outputRate: 94.67
            },
            {
                fuelType: 'Anthracite',
                outputRate: 103.69
            },
            {
                fuelType: 'Bituminous',
                outputRate: 93.28
            },
            {
                fuelType: 'Subbituminous',
                outputRate: 97.17
            },
            {
                fuelType: 'Lignite',
                outputRate: 97.72
            },
            {
                fuelType: 'Mixed - Commercial',
                outputRate: 94.27
            },
        ]
    },
    {
        energySource: 'Other fuels',
        fuelTypes: [
            {
                fuelType: 'Coal (industrial coking)',
                outputRate: 93.9
            },
            {
                fuelType: 'Coal Coke',
                outputRate: 113.67
            },
            {
                fuelType: 'Petroleum Coke',
                outputRate: 102.41
            },
            {
                fuelType: 'Blast Furnace Gas',
                outputRate: 274.32
            },
            {
                fuelType: 'Still Gas',
                outputRate: 66.72
            },
            {
                fuelType: 'Coke Oven Gas',
                outputRate: 46.85
            },          

        ]
    },
    {
        energySource: 'Mixed Fuels',
        fuelTypes: [
            {
                fuelType: '',
                outputRate: 0
            }
        ]

    }
];



export const coalFuels: Array<{
    fuelType: string,
    outputRate: number
}> = [
        {
            fuelType: 'Coal (industrial coking)',
            outputRate: 93.9
        },
        {
            fuelType: 'Coal Coke',
            outputRate: 113.67
        },
        {
            fuelType: 'Petroleum Coke',
            outputRate: 102.41
        },
        {
            fuelType: 'Mixed - Industrial Sector',
            outputRate: 94.67
        },
        {
            fuelType: 'Anthracite',
            outputRate: 103.69
        },
        {
            fuelType: 'Bituminous',
            outputRate: 93.28
        },
        {
            fuelType: 'Subbituminous',
            outputRate: 97.17
        },
        {
            fuelType: 'Lignite',
            outputRate: 97.72
        },
        {
            fuelType: 'Mixed - Commercial',
            outputRate: 94.27
        },

    ];


    
export const EAFOtherFuels: Array<OtherFuel> = [

    {
        energySource: 'Petroleum-based fuels',
        fuelTypes: [
            {
                fuelType: 'Diesel (Distillate Fuel #2)',
                outputRate: 73.96
            },
            {
                fuelType: 'Motor Gasoline',
                outputRate: 70.22
            },
            {
                fuelType: 'Liquified petroleum gases (LPG)',
                outputRate: 61.71
            },
            {
                fuelType: 'Kerosene',
                outputRate: 75.2
            },
            {
                fuelType: 'Crude Oil',
                outputRate: 74.54
            },
            {
                fuelType: 'Ethane',
                outputRate: 59.6
            },
            {
                fuelType: 'Ethylene',
                outputRate: 65.96
            },
            {
                fuelType: 'Propane',
                outputRate: 62.87
            },
            {
                fuelType: 'Propylene',
                outputRate: 67.77
            },
                      
            {
                fuelType: 'Isobutane',
                outputRate: 64.94
            },
            {
                fuelType: 'Butane',
                outputRate: 64.77
            },
            {
                fuelType: 'Pentanes Plus',
                outputRate: 70.02
            },
            {
                fuelType: 'Distillate Fuel #1',
                outputRate: 73.25
            },
            {
                fuelType: 'Distillate Fuel #4',
                outputRate: 75.04
            },
            {
                fuelType: 'Residual Fuel #5',
                outputRate: 72.93
            },
            {
                fuelType: 'Residual Fuel #6',
                outputRate: 75.1
            },
        ]

    },
    {
        energySource: 'Biomass fuels',
        fuelTypes: [
            {
                fuelType: 'Biodiesel',
                outputRate: 73.84
            },
            {
                fuelType: 'Ethanol',
                outputRate: 68.44
            },
            {
                fuelType: 'Wood',
                outputRate: 93.8
            },
            {
                fuelType: 'Bagasse Pulping Liquor',
                outputRate: 95.5
            },
            {
                fuelType: 'Agricultural Byproduct',
                outputRate: 118.17
            },
            {
                fuelType: 'Landfill Gas',
                outputRate: 52.07,
            }
        ]
    },
    {
        energySource: 'Coal',
        fuelTypes: [
            {
                fuelType: 'Mixed - Industrial Sector',
                outputRate: 94.67
            },
            {
                fuelType: 'Anthracite',
                outputRate: 103.69
            },
            {
                fuelType: 'Bituminous',
                outputRate: 93.28
            },
            {
                fuelType: 'Subbituminous',
                outputRate: 97.17
            },
            {
                fuelType: 'Lignite',
                outputRate: 97.72
            },
            {
                fuelType: 'Mixed - Commercial',
                outputRate: 94.27
            },
        ]
    },
    {
        energySource: 'Other fuels',
        fuelTypes: [
            {
                fuelType: 'Coal (industrial coking)',
                outputRate: 93.9
            },
            {
                fuelType: 'Coal Coke',
                outputRate: 113.67
            },
            {
                fuelType: 'Petroleum Coke',
                outputRate: 102.41
            },
            {
                fuelType: 'Blast Furnace Gas',
                outputRate: 274.32
            },
            {
                fuelType: 'Still Gas',
                outputRate: 66.72
            },
            {
                fuelType: 'Coke Oven Gas',
                outputRate: 46.85
            },          

        ]
    },
    {
        energySource: 'Mixed Fuels',
        fuelTypes: [
            {
                fuelType: '',
                outputRate: 0
            }
        ]

    },
    {
        energySource: 'None',
        fuelTypes: [
            {
                fuelType: '',
                outputRate: 0
            }
        ]

    },
    
];