export const specificEnergy = {
    metric: {
        kJkg: {
            name: {
                singular: 'Kilo Jule per Kilo Gram'
                , plural: 'Kilo Jules per Kilo Grams',
                display: '(kJ/kg)'
            }
            , to_anchor: 1
        }
    },
    imperial: {
        btuLb: {
            name: {
                singular: 'Btu per lb'
                , plural: 'Btu per lbs',
                display: '(Btu/lb)'
            }
            , to_anchor: 2.326
        }
    }
    , _anchors: {
        metric: {
            unit: 'kJkg'
            , ratio: 1
        }
        , imperial: {
            unit: 'btuLb'
            , ratio: 1
        }
    }
}
