export const density = {
    metric: {
        kgNm3: {
            name: {
                singular: 'Kilogram per Normal Cubic Meter'
                , plural: 'Kilogram per Normal Cubic Meters',
                display: '(kg/Nm&#x00B3)'
            }
            , to_anchor: 1
        }
    },
    imperial: {
        lbscf: {
            name: {
                singular: 'Pound per standard cubic foot'
                , plural: 'Pound per standard cubic feet',
                display: '(lb/scf)'
            }
            , to_anchor: 16.0185
        }
    }
    , _anchors: {
        metric: {
            unit: 'kgNm3'
            , ratio: 1
        }
        , imperial: {
            unit: 'lbscf'
            , ratio: 1
        }
    }
}
