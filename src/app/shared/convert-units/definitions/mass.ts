export const mass = {
    metric: {
        u: {
            name: {
                singular: 'Atomic Mass Unite',
                plural: 'Atomic Mass Unites',
                display: '(u)'
            },
            to_anchor: 0.000000000166054 / 100000000000000,
            group: 'Metric'
        },
        mcg: {
            name: {
                singular: 'Microgram',
                plural: 'Micrograms',
                display: '(mcg)'
            },
            to_anchor: 1 / 1000000,
            group: 'Metric'
        },
        mg: {
            name: {
                singular: 'Milligram',
                plural: 'Milligrams',
                display: '(mg)'
            },
            to_anchor: 1 / 1000,
            group: 'Metric'
        },
        g: {
            name: {
                singular: 'Gram',
                plural: 'Grams',
                display: '(g)'
            },
            to_anchor: 1,
            group: 'Metric'
        },
        kg: {
            name: {
                singular: 'Kilogram',
                plural: 'Kilograms',
                display: '(kg)'
            },
            to_anchor: 1000,
            group: 'Metric'
        },
        tonne: {
            name: {
                singular: 'Tonne',
                plural: 'Tonne',
                display: '(t)'
            },
            to_anchor: 1000000,
            group: 'Metric'
        },
        sl: {
            name: {
                singular: 'Slug',
                plural: 'Slugs',
                display: '(sl)'
            },
            to_anchor: 14593.9,
            group: 'Metric'
        }
    },

    imperial: {
        oz: {
            name: {
                singular: 'Ounce',
                plural: 'Ounces',
                display: '(oz)'
            },
            to_anchor: 1 / 16,
            group: 'Imperial'
        },
        lb: {
            name: {
                singular: 'Pound',
                plural: 'Pounds',
                display: '(lb)'
            },
            to_anchor: 1,
            group: 'Imperial'
        },
        klb: {
            name: {
                singular: 'Thousand pound',
                plural: 'Thousand pounds',
                display: '(klb)'
            },
            to_anchor: 1000,
            group: 'Imperial'
        },
        ton: {
            name: {
                singular: 'Imperial Ton',
                plural: 'Imperial Ton',
                display: '()'
            },
            to_anchor: 2240,
            group: 'Imperial'
        }
    },
    _anchors: {
        metric: {
            unit: 'g',
            ratio: 1 / 453.592
        },
        imperial: {
            unit: 'lb',
            ratio: 453.592
        }
    }
};