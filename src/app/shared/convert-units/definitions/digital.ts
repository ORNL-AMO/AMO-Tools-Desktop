export const digital = {
    bits: {
        b: {
            name: {
                singular: 'Bit'
                , plural: 'Bits' ,
                 display:  '(b)'
            }
            , to_anchor: 1
        }
        , Kb: {
            name: {
                singular: 'Kilobit'
                , plural: 'Kilobits' ,
                 display:  '(Kb)'
            }
            , to_anchor: 1024
        }
        , Mb: {
            name: {
                singular: 'Megabit'
                , plural: 'Megabits' ,
                 display:  '(Mb)'
            }
            , to_anchor: 1048576
        }
        , Gb: {
            name: {
                singular: 'Gigabit'
                , plural: 'Gigabits' ,
                 display:  '(Gb)'
            }
            , to_anchor: 1073741824
        }
        , Tb: {
            name: {
                singular: 'Terabit'
                , plural: 'Terabits',
                 display:  '(Tb)'
            }
            , to_anchor: 1099511627776
        }
    },

    bytes: {
        B: {
            name: {
                singular: 'Byte'
                , plural: 'Bytes' ,
                 display:  '(B)'
            }
            , to_anchor: 1
        }
        , KB: {
            name: {
                singular: 'Kilobyte'
                , plural: 'Kilobytes' ,
                 display:  '(KB)'
            }
            , to_anchor: 1024
        }
        , MB: {
            name: {
                singular: 'Megabyte'
                , plural: 'Megabytes' ,
                 display:  '(MB)'
            }
            , to_anchor: 1048576
        }
        , GB: {
            name: {
                singular: 'Gigabyte'
                , plural: 'Gigabytes' ,
                 display:  '(GB)'
            }
            , to_anchor: 1073741824
        }
        , TB: {
            name: {
                singular: 'Terabyte'
                , plural: 'Terabytes' ,
                 display:  '(TB)'
            }
            , to_anchor: 1099511627776
        }
    },
    _anchors: {
        bits: {
            unit: 'b'
            , ratio: 1 / 8
        }
        , bytes: {
            unit: 'B'
            , ratio: 8
        }
    }

}
