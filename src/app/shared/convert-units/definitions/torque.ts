export const torque = {
    metric: {
        Nm: {
            name: {
                singular: 'Newton-meter'
                , plural: 'Newton-meters' ,
                 display:  '(Nm)'
            }
            , to_anchor: .737562
        }
    },
    imperial: {
        lbft: {
            name: {
                singular: 'Pound-force foot'
                , plural: 'Pound-force feet' ,
                display:  '(lb-ft)'
            }
            , to_anchor: 1
        }
    }, 
    _anchors: {
        metric: {
            unit: 'Nm', 
            ratio: 1
        }, imperial: {
            unit: 'lbft', 
            ratio: 1
        }
    }
};