export const CompressorTypeOptions: Array<{ value: number, label: string }> = [
    {
        value: 1,
        label: "Single stage lubricant-injected rotary screw",
    },
    {
        value: 2,
        label: "Two stage lubricant-injected rotary screw",
    },
    {
        value: 3,
        label: "Two stage lubricant-free rotary screw",
    },
    {
        value: 4,
        label: "Single stage reciprocating",
    },
    {
        value: 5,
        label: "Two stage reciprocating",
    },
    {
        value: 6,
        label: "Multiple Stage Centrifugal",
    },
]

export const ControlTypes: Array<{value: number, label: string, compressorTypes: Array<number>}> = [
    {
        value: 1,
        label: 'Inlet modulation without unloading',
        compressorTypes: [1, 2]
    },
    {
        value: 2,
        label: 'Inlet modulation with unloading',
        compressorTypes: [1, 2]
    },
    {
        value: 3,
        label: 'Variable displacement with unloading',
        compressorTypes: [1, 2]
    },
    {
        value: 4,
        label: 'Load/unload',
        compressorTypes: [1, 2, 3, 4, 5, 6]
    },
    {
        value: 5,
        label: 'VFD',
        compressorTypes: [1, 2, 3]
    },
    {
        value: 6,
        label: 'Start/Stop',
        compressorTypes: [3, 4, 5]
    },
    {
        value: 7,
        label: 'Multi-step unloading',
        compressorTypes: [5]
    },
    {
        value: 8,
        label: 'Inlet butterfly modulation with blowoff',
        compressorTypes: [6]
    },
    {
        value: 9,
        label: 'Inlet butterfly modulation with unloading',
        compressorTypes: [6]
    },
    {
        value: 10,
        label: 'Inlet guide vane modulation with blowoff',
        compressorTypes: [6]
    },
    {
        value: 11,
        label: 'Inlet guide vane modulation with unloading',
        compressorTypes: [6]
    }
]