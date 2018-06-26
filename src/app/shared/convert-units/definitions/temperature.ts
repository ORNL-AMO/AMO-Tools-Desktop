export const temperature = {
    metric: {
        C: {
            name: {
                singular: 'Degree Celsius'
                , plural: 'Degrees Celsius' ,
                 display:  '(℃)'
            }
            , to_anchor: 1
            , anchor_shift: 0
        }
        // K: {
        //     name: {
        //         singular: 'Degree Kelvin'
        //         , plural: 'Degrees Kelvin' ,
        //          display:  '(K)'
        //     }
        //     , to_anchor: 1
        //     , anchor_shift: 273.15
        // }
    },
    imperial: {
        F: {
            name: {
                singular: 'Degree Fahrenheit'
                , plural: 'Degrees Fahrenheit' ,
                 display:  '(℉)'
            }
            , to_anchor: 1
        }
    },
    _anchors: {
        metric: {
            unit: 'C'
            , transform: function (C) { return C / (5 / 9) + 32 }
        }
        , imperial: {
            unit: 'F'
            , transform: function (F) { return (F - 32) * (5 / 9) }
        }
    }
}
