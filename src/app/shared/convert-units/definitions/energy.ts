export const energy = {
    energy: {
        Wh: {
            name: {
                singular: 'Watt-hour'
                , plural: 'Watt-hours' ,
                 display:  '(Wh)'
            }
            , to_anchor: 3600
        }
        , mWh: {
            name: {
                singular: 'Milliwatt-hour'
                , plural: 'Milliwatt-hours' ,
                 display:  '(mWh)'
            }
            , to_anchor: 3.6
        }
        , kWh: {
            name: {
                singular: 'Kilowatt-hour'
                , plural: 'Kilowatt-hours' ,
                 display:  '(kWh)'
            }
            , to_anchor: 3600000
        }
        , MWh: {
            name: {
                singular: 'Megawatt-hour'
                , plural: 'Megawatt-hours' ,
                 display:  '(MWh)'
            }
            , to_anchor: 3600000000
        }
        , GWh: {
            name: {
                singular: 'Gigawatt-hour'
                , plural: 'Gigawatt-hours' ,
                 display:  '(GWh)'
            }
            , to_anchor: 3600000000000
        }
        , J: {
            name: {
                singular: 'Joule'
                , plural: 'Joules' ,
                 display:  '(J)'
            }
            , to_anchor: 1
        }
        , kJ: {
            name: {
                singular: 'Kilojoule'
                , plural: 'Kilojoules' ,
                 display:  '(kJ)'
            }
            , to_anchor: 1000
        }
    }
    , _anchors: {
        metric: {
            unit: 'J'
            , ratio: 1
        }
    }
};
