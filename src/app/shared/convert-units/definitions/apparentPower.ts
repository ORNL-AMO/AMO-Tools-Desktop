export const apparentPower = {

    apparentPower: {
        VA: {
            name: {
                singular: 'Volt-Ampere'
                , plural: 'Volt-Amperes',
                 display:  '(VA)'
            }
            , to_anchor: 1
        }
        , mVA: {
            name: {
                singular: 'Millivolt-Ampere'
                , plural: 'Millivolt-Amperes',
                 display:  '(mVA)'
            }
            , to_anchor: .001
        }
        , kVA: {
            name: {
                singular: 'Kilovolt-Ampere'
                , plural: 'Kilovolt-Amperes',
                 display:  '(kVA)'
            }
            , to_anchor: 1000
        }
        , MVA: {
            name: {
                singular: 'Megavolt-Ampere'
                , plural: 'Megavolt-Amperes',
                 display:  '(MVA)'
            }
            , to_anchor: 1000000
        }
        , GVA: {
            name: {
                singular: 'Gigavolt-Ampere'
                , plural: 'Gigavolt-Amperes',
                 display:  '(GVA)'
            }
            , to_anchor: 1000000000
        }
    }
    , _anchors: {
        metric: {
            unit: 'VA'
            , ratio: 1
        }
    }
};
