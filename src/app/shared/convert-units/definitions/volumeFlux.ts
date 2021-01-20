export const volumeFlux = {
    metric: {
        'L/m2h': {
            name: {
                singular: 'Liter per meters squared-hour'
                , plural: 'Liters per meters squared-hour',
                display: '(L/m&#x00B2h)'
            }
            , to_anchor: 24
        },
        'L/m2d': {
            name: {
                singular: 'Liter per meters squared-day'
                , plural: 'Liters per meters squared-day',
                display: '(L/m&#x00B2d)'
            }
            , to_anchor: 1
        }
    },

    imperial: {
        'gal/ft2d': {
            name: {
                singular: 'Gallon per square foot-day'
                , plural: 'Gallons per square foot-day',
                display: '(gal/ft&#x00B2d)'
            }
            , to_anchor: 1
        }
    },
    _anchors: {
        metric: {
            unit: 'L/m2d'
            , ratio: 1 / 40.7458
        }
        , imperial: {
            unit: 'gal/ft2d'
            , ratio: 40.7458
        }
    }
};
