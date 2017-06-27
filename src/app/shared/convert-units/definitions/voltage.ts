export const voltage = {
    voltage: {
        V: {
            name: {
                singular: 'Volt'
                , plural: 'Volts' ,
                 display:  '(V)'
            }
            , to_anchor: 1
        }
        , mV: {
            name: {
                singular: 'Millivolt'
                , plural: 'Millivolts' ,
                 display:  '(mV)'
            }
            , to_anchor: .001
        }
        , kV: {
            name: {
                singular: 'Kilovolt'
                , plural: 'Kilovolts' ,
                 display:  '(kV)'
            }
            , to_anchor: 1000
        }
    }
    , _anchors: {
        metric: {
            unit: 'V'
            , ratio: 1
        }
    }
}
