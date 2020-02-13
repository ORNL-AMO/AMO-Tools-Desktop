export const thermalConductivity = {
    metric: {
        'W/mK': {
            name: {
                singular: 'Watts per meter-Kelvin',
                plural: 'Watts per meter-Kelvin',
                display: '(W/mK)'
            },
            to_anchor: 1
        }
    },
    imperial: {
        'Btu/hr-ft-R': {
            name: {
                singular: 'BTU per hour-feet-Rankin',
                plural: 'BTUs per hour-feet-Rankin',
                display: '(Btu/hr-ft-R)'
            },
            to_anchor: 1.7305028512
        }
    },
    _anchors: {
        metric: {
            unit: 'W/mK',
            ratio: 1
        },
        imperial: {
            unit: 'Btu/hr-ft-R',
            ratio: 1
        }
    }
};