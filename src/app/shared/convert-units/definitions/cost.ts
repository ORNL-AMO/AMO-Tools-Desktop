export const cost = {
    cost: {
        $: {
            name: {
                singular: 'dollar'
                , plural: 'dollars' ,
                 display:  '($)'
            }
            , to_anchor: 1
        }
        , $k: {
            name: {
                singular: 'thousand dollar'
                , plural: 'thousand dollars' ,
                 display:  '($k)'
            }
            , to_anchor: 1000
        }
    },
    _anchors: {
        metric: {
            unit: '$'
            , ratio: 1
        }
    }
};