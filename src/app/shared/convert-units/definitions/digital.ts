export const digital = {
    bits: {
        b: {
            name: {
                singular: 'Bit',
                plural: 'Bits',
                display: '(b)'
            },
            to_anchor: 1,
            group: 'Bits'
        },
        Kb: {
            name: {
                singular: 'Kilobit',
                plural: 'Kilobits',
                display: '(Kb)'
            },
            to_anchor: 1024,
            group: 'Bits'
        },
        Mb: {
            name: {
                singular: 'Megabit',
                plural: 'Megabits',
                display: '(Mb)'
            },
            to_anchor: 1048576,
            group: 'Bits'
        },
        Gb: {
            name: {
                singular: 'Gigabit',
                plural: 'Gigabits',
                display: '(Gb)'
            },
            to_anchor: 1073741824,
            group: 'Bits'
        },
        Tb: {
            name: {
                singular: 'Terabit',
                plural: 'Terabits',
                display: '(Tb)'
            },
            to_anchor: 1099511627776,
            group: 'Bits'
        }
    },

    bytes: {
        B: {
            name: {
                singular: 'Byte',
                plural: 'Bytes',
                display: '(B)'
            },
            to_anchor: 1,
            group: 'Bytes'
        },
        KB: {
            name: {
                singular: 'Kilobyte',
                plural: 'Kilobytes',
                display: '(KB)'
            },
            to_anchor: 1024,
            group: 'Bytes'
        },
        MB: {
            name: {
                singular: 'Megabyte',
                plural: 'Megabytes',
                display: '(MB)'
            },
            to_anchor: 1048576,
            group: 'Bytes'
        },
        GB: {
            name: {
                singular: 'Gigabyte',
                plural: 'Gigabytes',
                display: '(GB)'
            },
            to_anchor: 1073741824,
            group: 'Bytes'
        },
        TB: {
            name: {
                singular: 'Terabyte',
                plural: 'Terabytes',
                display: '(TB)'
            },
            to_anchor: 1099511627776,
            group: 'Bytes'
        }
    },
    _anchors: {
        bits: {
            unit: 'b',
            ratio: 1 / 8
        },
        bytes: {
            unit: 'B',
            ratio: 8
        }
    }
};