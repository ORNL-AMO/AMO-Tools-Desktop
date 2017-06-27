export const area = {
    metric: {
        mm2: {
            name: {
                singular: 'Square Millimeter'
                , plural: 'Square Millimeters' ,
                 display:  'mm&#x00B2;'
            }
            , to_anchor: 1 / 1000000
        }
        , cm2: {
            name: {
                singular: 'Centimeter'
                , plural: 'Centimeters',
              display:  'cm&#x00B2;'

            }
            , to_anchor: 1 / 10000
        }
        , m2: {
            name: {
                singular: 'Square Meter'
                , plural: 'Square Meters',
              display:  'm&#x00B2;'
            }
            , to_anchor: 1
        }
        , ha: {
            name: {
                singular: 'Hectare'
                , plural: 'Hectares'
            }
            , to_anchor: 10000
        }
        , km2: {
            name: {
                singular: 'Square Kilometer'
                , plural: 'Square Kilometers' ,
              display:  'km&#x00B2;'
            }
            , to_anchor: 1000000
        }
    },
    imperial: {
        'in2': {
            name: {
                singular: 'Square Inch'
                , plural: 'Square Inches',
              display:  'in&#x00B2;'
            }
            , to_anchor: 1 / 144
        }
        , yd2: {
            name: {
                singular: 'Square Yard'
                , plural: 'Square Yards',
              display:  'yd&#x00B2;'
            }
            , to_anchor: 9
        }
        , ft2: {
            name: {
                singular: 'Square Foot'
                , plural: 'Square Feet',
              display:  'ft&#x00B2;'
            }
            , to_anchor: 1
        }
        , ac: {
            name: {
                singular: 'Acre'
                , plural: 'Acres'
            }
            , to_anchor: 43560
        }
        , mi2: {
            name: {
                singular: 'Square Mile'
                , plural: 'Square Miles',
              display:  'mi&#x00B2;'
            }
            , to_anchor: 27878400
        }
    },
    _anchors: {
        metric: {
            unit: 'm2'
            , ratio: 10.7639
        }
        , imperial: {
            unit: 'ft2'
            , ratio: 1 / 10.7639
        }
    }
}
