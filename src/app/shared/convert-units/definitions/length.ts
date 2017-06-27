export const length = {
    metric: {
        mm: {
            name: {
                singular: 'Millimeter'
                , plural: 'Millimeters' ,
                 display:  '(mm)'
            }
            , to_anchor: 1 / 1000
        }
        , cm: {
            name: {
                singular: 'Centimeter'
                , plural: 'Centimeters' ,
                 display:  '(cm)'
            }
            , to_anchor: 1 / 100
        }
        , m: {
            name: {
                singular: 'Meter'
                , plural: 'Meters' ,
                 display:  '(m)'
            }
            , to_anchor: 1
        }
        , km: {
            name: {
                singular: 'Kilometer'
                , plural: 'Kilometers' ,
                 display:  '(km)'
            }
            , to_anchor: 1000
        }
    },
    imperial: {
        'in': {
            name: {
                singular: 'Inch'
                , plural: 'Inches' ,
                 display:  '(in)'
            }
            , to_anchor: 1 / 12
        }
        , yd: {
            name: {
                singular: 'Yard'
                , plural: 'Yards' ,
                 display:  '(yd)'
            }
            , to_anchor: 3
        }
        , ft: {
            name: {
                singular: 'Foot'
                , plural: 'Feet' ,
                 display:  '(ft)'
            }
            , to_anchor: 1
        }
        , mi: {
            name: {
                singular: 'Mile'
                , plural: 'Miles' ,
                 display:  '(mi)'
            }
            , to_anchor: 5280
        }
    },
    _anchors: {
        metric: {
            unit: 'm'
            , ratio: 3.281
        }
        , imperial: {
            unit: 'ft'
            , ratio: 1 / 3.281
        }
    }
}
