export const power = {
    power: {
        W: {
            name: {
                singular: 'Watt'
                , plural: 'Watts' ,
                 display:  '(W)'
            }
            , to_anchor: 1
        }
        , mW: {
            name: {
                singular: 'Milliwatt'
                , plural: 'Milliwatts' ,
                 display:  '(mW)'
            }
            , to_anchor: .001
        }
        , kW: {
            name: {
                singular: 'Kilowatt'
                , plural: 'Kilowatts' ,
                 display:  '(kW)'
            }
            , to_anchor: 1000
        }
        , MW: {
            name: {
                singular: 'Megawatt'
                , plural: 'Megawatts' ,
                 display:  '(MW)'
            }
            , to_anchor: 1000000
        }
        , GW: {
            name: {
                singular: 'Gigawatt'
                , plural: 'Gigawatts' ,
                 display:  '(GW)'
            }
            , to_anchor: 1000000000
        }, hp: {
            name: {
               singular: 'Horse Power',
                 plural: 'Horse Power' ,
                display:  '(hp)'
            },
            to_anchor: 745.7
        }
    },
    _anchors: {
        metric: {
            unit: 'W'
            , ratio: 1
        }
    }
};
