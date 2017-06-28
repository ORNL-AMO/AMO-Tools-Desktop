export const reactiveEnergy = {

    reactiveEnergy: {
        VARh: {
            name: {
                singular: 'Volt-Ampere Reactive Hour'
                , plural: 'Volt-Amperes Reactive Hour' ,
                 display:  '(VAR/h)'
            }
            , to_anchor: 1
        }
        , mVARh: {
            name: {
                singular: 'Millivolt-Ampere Reactive Hour'
                , plural: 'Millivolt-Amperes Reactive Hour' ,
                 display:  '(mVAR/h)'
            }
            , to_anchor: .001
        }
        , kVARh: {
            name: {
                singular: 'Kilovolt-Ampere Reactive Hour'
                , plural: 'Kilovolt-Amperes Reactive Hour' ,
                 display:  '(KVAR/h)'
            }
            , to_anchor: 1000
        }
        , MVARh: {
            name: {
                singular: 'Megavolt-Ampere Reactive Hour'
                , plural: 'Megavolt-Amperes Reactive Hour' ,
                 display:  '(MVAR/h)'
            }
            , to_anchor: 1000000
        }
        , GVARh: {
            name: {
                singular: 'Gigavolt-Ampere Reactive Hour'
                , plural: 'Gigavolt-Amperes Reactive Hour' ,
                 display:  '(GVAR/h)'
            }
            , to_anchor: 1000000000
        }
    }, _anchors: {
        metric: {
            unit: 'VARh'
            , ratio: 1
        }
    }
};
