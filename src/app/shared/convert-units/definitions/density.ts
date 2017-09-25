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
        , kgL: {
          name: {
            singular: 'Kilogram per Litter'
            , plural: 'Kilograms per Litter' ,
            display: '(kg/L)'
          }
        , to_anchor: 1000
      }
    },
    imperial: {
        lbscf: {
            name: {
                singular: 'Pound per standard cubic foot'
                , plural: 'Pounds per standard cubic feet',
                display: '(lb/scf)'
            }
            , to_anchor: 1
        }
        , lbgal: {
          name: {
            singular: 'Pound per Gallon'
            , plural: 'Pounds per Gallon' ,
            display: '(lb/gal)'
          }
          , to_anchor: 7.48052
      }
    }
    , _anchors: {
        metric: {
            unit: 'kgNm3'
            , ratio: 1 / 16.0185
        }
        , imperial: {
            unit: 'lbscf'
            , ratio: 16.0185
        }
    }
}
