export const mass = {
    metric: {
        mcg: {
            name: {
                singular: 'Microgram'
                , plural: 'Micrograms' ,
                 display:  '(mcg)'
            }
            , to_anchor: 1 / 1000000
        }
        , mg: {
            name: {
                singular: 'Milligram'
                , plural: 'Milligrams' ,
                 display:  '(mg)'
            }
            , to_anchor: 1 / 1000
        }
        , g: {
            name: {
                singular: 'Gram'
                , plural: 'Grams' ,
                 display:  '(g)'
            }
            , to_anchor: 1
        }
        , kg: {
            name: {
                singular: 'Kilogram'
                , plural: 'Kilograms' ,
                 display:  '(kg)'
            }
            , to_anchor: 1000
        }
    },

    imperial: {
        oz: {
            name: {
                singular: 'Ounce'
                , plural: 'Ounces' ,
                 display:  '(oz)'
            }
            , to_anchor: 1 / 16
        }
        , lb: {
            name: {
                singular: 'Pound'
                , plural: 'Pounds' ,
                 display:  '(lb)'
            }
            , to_anchor: 1
        }
    },
    _anchors: {
        metric: {
            unit: 'g'
            , ratio: 1 / 453.592
        }
        , imperial: {
            unit: 'lb'
            , ratio: 453.592
        }
    }
}
