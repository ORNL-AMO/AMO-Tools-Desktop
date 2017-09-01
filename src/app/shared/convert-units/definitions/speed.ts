export const speed = {
    metric: {
        'm/s': {
            name: {
                singular: 'Metre per second'
                , plural: 'Metres per second' ,
                 display:  '(m/s)'
            }
            , to_anchor: 3.6
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
        'm/h': {
            name: {
                singular: 'Mile per hour'
                , plural: 'Miles per hour' ,
                 display:  '(m/h)'
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
        }
    },
    _anchors: {
        metric: {
            unit: 'km/h'
            , ratio: 1 / 1.609344
        }
        , imperial: {
            unit: 'm/h'
            , ratio: 1.609344
        }
    }
}
