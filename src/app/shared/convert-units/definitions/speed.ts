export const speed = {
    metric: {
        'm/s': {
            name: {
                singular: 'Metre per second'
                , plural: 'Metres per second' ,
                 display:  '(m/s)'
            }
            , to_anchor: 3.6
        },
        'm/d': {
            name: {
                singular: 'Metre per day'
                , plural: 'Metres per day' ,
                 display:  '(m/d)'
            }
            , to_anchor: 24
        },
        'm/h': {
            name: {
                singular: 'Metre per hour'
                , plural: 'Metres per hour' ,
                 display:  '(m/h)'
            }
            , to_anchor: 1000
        }
        , 'km/h': {
            name: {
                singular: 'Kilometre per hour'
                , plural: 'Kilometres per hour' ,
                 display:  '(km/s)'
            }
            , to_anchor: 1
        }
    },
    imperial: {
        'mph': {
            name: {
                singular: 'Mile per hour'
                , plural: 'Miles per hour' ,
                 display:  '(mph)'
            }
            , to_anchor: 1
        }
        , knot: {
            name: {
                singular: 'Knot'
                , plural: 'Knots' ,
                 display:  '(knot)'
            }
            , to_anchor: 1.150779
        }
        , 'ft/s': {
            name: {
                singular: 'Foot per second'
                , plural: 'Feet per second' ,
                 display:  '(ft/s)'
            }
            , to_anchor: 0.681818
        }, 'ft/min': {
            name: {
                singular: 'Foot per minute',
                plural: 'Feet per minute',
                display: '(ft/s)'
            },
            to_anchor: 0.0113636
        }
    },
    _anchors: {
        metric: {
            unit: 'km/h'
            , ratio: 1 / 1.609344
        }
        , imperial: {
            unit: 'mph'
            , ratio: 1.609344
        }
    }
};
