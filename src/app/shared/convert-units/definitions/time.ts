var daysInYear: 365.25;
export const time = {
    time: {
        ns: {
            name: {
                singular: 'Nanosecond'
                , plural: 'Nanoseconds' ,
                 display:  '(ns)'
            }
            , to_anchor: 1 / 1000000000
        }
        , mu: {
            name: {
                singular: 'Microsecond'
                , plural: 'Microseconds' ,
                 display:  '(mu)'
            }
            , to_anchor: 1 / 1000000
        }
        , ms: {
            name: {
                singular: 'Millisecond'
                , plural: 'Milliseconds' ,
                 display:  '(ms)'
            }
            , to_anchor: 1 / 1000
        }
        , s: {
            name: {
                singular: 'Second'
                , plural: 'Seconds' ,
                 display:  '(s)'
            }
            , to_anchor: 1
        }
        , min: {
            name: {
                singular: 'Minute'
                , plural: 'Minutes' ,
                 display:  '(min)'
            }
            , to_anchor: 60
        }
        , h: {
            name: {
                singular: 'Hour'
                , plural: 'Hours' ,
                 display:  '(h)'
            }
            , to_anchor: 60 * 60
        }
        , d: {
            name: {
                singular: 'Day'
                , plural: 'Days' ,
                 display:  '(d)'
            }
            , to_anchor: 60 * 60 * 24
        }
        , week: {
            name: {
                singular: 'Week'
                , plural: 'Weeks' ,
                 display:  '(week)'
            }
            , to_anchor: 60 * 60 * 24 * 7
        }
        , month: {
            name: {
                singular: 'Month'
                , plural: 'Months' ,
                 display:  '(months)'
            }
            , to_anchor: 60 * 60 * 24 * daysInYear / 12
        }
        , year: {
            name: {
                singular: 'Year'
                , plural: 'Years' ,
              display:  '(year)'
            }
            , to_anchor: 60 * 60 * 24 * daysInYear
        }
    },
    _anchors: {
        metric: {
            unit: 's'
            , ratio: 1
        }
    }
}
