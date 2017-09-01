export const partsPer = {
    metric: {
        ppm: {
            name: {
                singular: 'Part-per Million'
                , plural: 'Parts-per Million' ,
                 display:  '(ppm)'
            }
            , to_anchor: 1
        }
        , ppb: {
            name: {
                singular: 'Part-per Billion'
                , plural: 'Parts-per Billion' ,
                 display:  '(ppb)'
            }
            , to_anchor: .001
        }
        , ppt: {
            name: {
                singular: 'Part-per Trillion'
                , plural: 'Parts-per Trillion' ,
                 display:  '(ppt)'
            }
            , to_anchor: .000001
        }
        , ppq: {
            name: {
                singular: 'Part-per Quadrillion'
                , plural: 'Parts-per Quadrillion' ,
                 display:  '(ppq)'
            }
            , to_anchor: .000000001
        }
    },
    imperial: {},
    _anchors: {
        metric: {
            unit: 'ppm'
            , ratio: .000001
        }
    }
}
