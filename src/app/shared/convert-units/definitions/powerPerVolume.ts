export const powerPerVolume = {
    imperial: {
        hpMgal: {
            name: {
                singular: 'Horsepower per Million Gallons',
                plural: 'Horsepower per Million Gallons',
                display: '(hp/Mgal)'
            },
            to_anchor: 1
        },
    },
    metric: {
        kWm3: {
            name: {
                singular: 'Kilowatt per Cubic Meter',
                plural: 'Kilowatts per Cubic Meter',
                display: '(kW/m&#x00B3)'
            },
            to_anchor: 1
        },
    },
    _anchors: {
        metric: {
            unit: 'kWm3',
            ratio: 5076.32082
        },
        imperial: {
            unit: 'hpMgal',
            ratio: 1 / 5076.32082
        }
    }
};
