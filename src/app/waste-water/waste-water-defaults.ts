export const aerationRanges: AerationRanges = {
    
    diffusers: [
        {
            label: 'Ultra-fine bubble diffusers',
            min: 2.8,
            max: 4.6,
            default: 3.7
        },
        {
            label: 'Fine bubble diffusers',
            min: 2.0,
            max: 3.8,
            default: 3.1

        },
        {
            label: 'Medium bubble diffusers',
            min: 1.7,
            max: 3.0,
            default: 2.4

        },
        {
            label: 'Coarse bubble diffusers',
            min: 1.0,
            max: 2.4,
            default: 1.9

        },
    ] ,
    mechanical: [
        {
            label: 'Surface slow speed',
            min: 2.3,
            max: 3.9,
            default: 3.1

        },
        {
            label: 'Surface slow speed w/ draft tube',
            min: 2.0,
            max: 3.6,
            default: 2.8
        },
        {
            label: 'Surface high speed',
            min: 2.0,
            max: 3.3,
            default: 2.7
        },
        {
            label: 'Surface downdraft turbine',
            min: 1.7,
            max: 3.3,
            default: 2.6
        },
        {
            label: 'Submerged turbine w/ sparger',
            min: 2.0,
            max: 3.0,
            default: 2.6,
        },
        {
            label: 'Submerged impeller',
            min: 2.0,
            max: 3.0,
            default: 2.6

        },
        {
            label: 'Surface brush and blade',
            min: 2.0,
            max: 3.3,
            default: 2.7
        },
        {
            label: 'Surface Orbal disc',
            min: 1.8,
            max: 3.0,
            default: 2.4
        },
        {
            label: 'Aspirator',
            min: 1.6,
            max: 2.6,
            default: 2.1
        },
    ],
    hybrid: [
        {
            label: 'Static tube system',
            min: 2.0,
            max: 2.6,
            default: 2.3

        },
        {
            label: 'Jet',
            min: 2.0,
            max: 3.8,
            default: 2.9
        },
    ]
}


export const aeratorTypes: Array<{ value: number, display: string }> = [
    {
      value: 1,
      display: 'Mechanical Aerator'
    },
    {
      value: 2,
      display: 'Positive Displacement Blower'
    },
    {
      value: 3,
      display: 'Centrifugal Blowers'
    }
]

export const getSOTRDefaults = ():Array<{label: string, value: number}>  => {
    let defaults: Array<{label: string, value: number}> = [];
    aerationRanges.diffusers.forEach(range => defaults.push({label: range.label, value: range.default}));
    aerationRanges.mechanical.forEach(range => defaults.push({label: range.label, value: range.default}));
    aerationRanges.hybrid.forEach(range => defaults.push({label: range.label, value: range.default}));
    return defaults;
}

export interface AerationRanges {
    diffusers: Array<AerationConstants>,
    mechanical: Array<AerationConstants>,
    hybrid: Array<AerationConstants>,
}

export interface AerationConstants {
    label: string,
    min: number, 
    max: number 
    default: number
}
