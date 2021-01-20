export const massFlux = {
    metric: {
        'kg/m2h': {
            name: {
                singular: 'Kilogram per meters squared-hour'
                , plural: 'Kilograms per meters squared-hour',
                display: '(kg/m&#x00B2h)'
            }
            , to_anchor: 24
        },
        'kg/m2d': {
            name: {
                singular: 'Kilogram per meters squared-day'
                , plural: 'Kilograms per meters squared-day',
                display: '(kg/m&#x00B2d)'
            }
            , to_anchor: 1
        }
    },

    imperial: {
        'lb/ft2d': {
            name: {
                singular: 'Pound per square foot-day'
                , plural: 'Pounds per square foot-day',
                display: '(lb/ft&#x00B2d)'
            }
            , to_anchor: 1
        }
    },
    _anchors: {
        metric: {
            unit: 'kg/m2d'
            , ratio: 1/4.88243
        }
        , imperial: {
            unit: 'lb/ft2d'
            , ratio: 4.88243
        }
    }
};
