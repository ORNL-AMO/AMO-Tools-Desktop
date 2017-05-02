export const viscosity = {
    viscosity: {
        cST: {
            name: {
                singular: 'Centistoke',
                plural: 'Centistokes'
            },
            to_anchor: 1
        },
        St: {
            name: {
                singular: 'Stoke',
                plural: 'Stokes'
            },
            to_anchor: 100
        },
        'cm2/s': {
            name: {
                singular: 'Square Centimeter per Second',
                plural: 'Square Centimeters per Second'
            },
            to_anchor: 100
        },
        'm2/s': {
            name: {
                singular: 'Square Meter per Second',
                plural: 'Square Meters per Second'
            },
            to_anchor: 1000000
        }
    },
    _anchors: {
        metric: {
            unit: 'cST',
            ration: 1
        }
    }
}