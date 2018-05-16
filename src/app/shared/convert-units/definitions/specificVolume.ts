export const specificVolume = {
    metric: {
        m3kg: {
            name: {
                singular: 'Cubic Meter per Kilogram',
                plural: 'Cubic Meters per Kilogram',
                display: '(m&#x00B3;/kg)'
            },
            to_anchor: 1
        }
    },
    imperial: {
        ft3lb: {
            name: {
                singular: 'Cubic Foot per Pound',
                plural: 'Cubic Feet per Pound',
                display: '(ft&#x00B3;/lb)'
            },
            to_anchor: 1
        }
    },
    _anchors: {
        metric: {
            unit: 'm3kg'
            , ratio: 1
        }
        , imperial: {
            unit: 'ft3lb'
            , ratio: 16.0185
        }
    }
}