export const current = {
    current: {
        A: {
            name: {
                singular: 'Ampere'
                , plural: 'Amperes' ,
                 display:  '(A)'
            }
            , to_anchor: 1
        }
        , mA: {
            name: {
                singular: 'Milliampere'
                , plural: 'Milliamperes' ,
                 display:  '(mA)'
            }
            , to_anchor: .001
        }
        , kA: {
            name: {
                singular: 'Kiloampere'
                , plural: 'Kiloamperes',
                 display:  '(kA)'
            }
            , to_anchor: 1000
        },
    },
    _anchors: {
        metric: {
            unit: 'A'
            , ratio: 1
        }
    }
}
