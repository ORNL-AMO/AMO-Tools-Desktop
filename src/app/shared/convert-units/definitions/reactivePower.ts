export const reactivePower = {
    reactivePower: {
        mVAR: {
            name: {
                singular: 'Millivolt-Ampere Reactive'
                , plural: 'Millivolt-Amperes Reactive' ,
                 display:  '(mVAR)'
            }
            , to_anchor: .001
        }
        , VAR: {
            name: {
                singular: 'Volt-Ampere Reactive'
                , plural: 'Volt-Amperes Reactive' ,
                 display:  '(VAR)'
            }
            , to_anchor: 1
        }
        , kVAR: {
            name: {
                singular: 'Kilovolt-Ampere Reactive'
                , plural: 'Kilovolt-Amperes Reactive' ,
                 display:  '(kVAR)'
            }
            , to_anchor: 1000
        }
        , MVAR: {
            name: {
                singular: 'Megavolt-Ampere Reactive'
                , plural: 'Megavolt-Amperes Reactive' ,
                 display:  '(MVAR)'
            }
            , to_anchor: 1000000
        }
        , GVAR: {
            name: {
                singular: 'Gigavolt-Ampere Reactive'
                , plural: 'Gigavolt-Amperes Reactive' ,
                 display:  '(GVAR)'
            }
            , to_anchor: 1000000000
        }
    }
    , _anchors: {
        metric: {
            unit: 'VAR'
            , ratio: 1
        }
    }
};