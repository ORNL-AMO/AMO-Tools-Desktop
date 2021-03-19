export const massPerPower = {
    imperial: {
        lbhp: {
            name: {
                singular: 'Pound per horsepower',
                plural: 'Pounds per horsepower',
                display: '(lb/hp)'
            },
            to_anchor: 1
        },
    },
    metric: {
        kgkw: {
            name: {
                singular: 'Kilogram per Kilowatt',
                plural: 'Kilograms per Kilowatt',
                display: '(kg/kW)'
            },
            to_anchor: 1
        },
    },
    _anchors: {
        metric: {
            unit: 'kgkw',
            ratio: 1 / .608277
        },
        imperial: {
            unit: 'lbhp',
            ratio: .608277
        }
    }
};
