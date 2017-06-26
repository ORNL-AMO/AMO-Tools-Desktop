export const volumeFlowRate = {
    metric: {
        'mm3/s': {
            name: {
                singular: 'Cubic Millimeter per second'
                , plural: 'Cubic Millimeters per second',
              display:  'mm&‌#x00B3;/s'
            }
            , to_anchor: 1 / 1000000
        }
        , 'cm3/s': {
            name: {
                singular: 'Cubic Centimeter per second'
                , plural: 'Cubic Centimeters per second',
                 display:  'cm&‌#x00B3;/s'
            }
            , to_anchor: 1 / 1000
        }
        , 'mL/s': {
            name: {
                singular: 'Milliliter per second'
                , plural: 'Milliliters per second'
            }
            , to_anchor: 1 / 1000
        }
        , 'cL/s': {
            name: {
                singular: 'Centiliter per second'
                , plural: 'Centiliters per second'
            }
            , to_anchor: 1 / 100
        }
        , 'dL/s': {
            name: {
                singular: 'Deciliter per second'
                , plural: 'Deciliters per second'
            }
            , to_anchor: 1 / 10
        }
        , 'L/s': {
            name: {
                singular: 'Liter per second'
                , plural: 'Liters per second'
            }
            , to_anchor: 1
        }
        , 'L/min': {
            name: {
                singular: 'Liter per minute'
                , plural: 'Liters per minute'
            }
            , to_anchor: 1 / 60
        }
        , 'L/h': {
            name: {
                singular: 'Liter per hour'
                , plural: 'Liters per hour'
            }
            , to_anchor: 1 / 3600
        }
        , 'kL/s': {
            name: {
                singular: 'Kiloliter per second'
                , plural: 'Kiloliters per second'
            }
            , to_anchor: 1000
        }
        , 'kL/min': {
            name: {
                singular: 'Kiloliter per minute'
                , plural: 'Kiloliters per minute'
            }
            , to_anchor: 50 / 3
        }
        , 'kL/h': {
            name: {
                singular: 'Kiloliter per hour'
                , plural: 'Kiloliters per hour'
            }
            , to_anchor: 5 / 18
        }
        , 'm3/s': {
            name: {
                singular: 'Cubic meter per second'
                , plural: 'Cubic meters per second',
              display:  'm&‌#x00B3;/s'
            }
            , to_anchor: 1000
        }
        , 'm3/min': {
            name: {
                singular: 'Cubic meter per minute'
                , plural: 'Cubic meters per minute',
                 display:  'm&‌#x00B3;/min'
            }
            , to_anchor: 50 / 3
        }
        , 'm3/h': {
            name: {
                singular: 'Cubic meter per hour'
                , plural: 'Cubic meters per hour',
                 display:  'm&‌#x00B3;/h'
            }
            , to_anchor: 5 / 18
        }
        , 'km3/s': {
            name: {
                singular: 'Cubic kilometer per second'
                , plural: 'Cubic kilometers per second',
                 display:  'km&‌#x00B3;/s'
            }
            , to_anchor: 1000000000000
        }
    },
    imperial: {
        'tsp/s': {
            name: {
                singular: 'Teaspoon per second'
                , plural: 'Teaspoons per second'
            }
            , to_anchor: 1 / 6
        }
        , 'Tbs/s': {
            name: {
                singular: 'Tablespoon per second'
                , plural: 'Tablespoons per second'
            }
            , to_anchor: 1 / 2
        }
        , 'in3/s': {
            name: {
                singular: 'Cubic inch per second'
                , plural: 'Cubic inches per second',
                 display:  'in&‌#x00B3;/s'
            }
            , to_anchor: 0.55411
        }
        , 'in3/min': {
            name: {
                singular: 'Cubic inch per minute'
                , plural: 'Cubic inches per minute',
                 display:  'in&‌#x00B3;/min'
            }
            , to_anchor: 0.55411 / 60
        }
        , 'in3/h': {
            name: {
                singular: 'Cubic inch per hour'
                , plural: 'Cubic inches per hour',
                 display:  'in&‌#x00B3;/h'
            }
            , to_anchor: 0.55411 / 3600
        }
        , 'fl-oz/s': {
            name: {
                singular: 'Fluid Ounce per second'
                , plural: 'Fluid Ounces per second'
            }
            , to_anchor: 1
        }
        , 'fl-oz/min': {
            name: {
                singular: 'Fluid Ounce per minute'
                , plural: 'Fluid Ounces per minute'
            }
            , to_anchor: 1 / 60
        }
        , 'fl-oz/h': {
            name: {
                singular: 'Fluid Ounce per hour'
                , plural: 'Fluid Ounces per hour'
            }
            , to_anchor: 1 / 3600
        }
        , 'cup/s': {
            name: {
                singular: 'Cup per second'
                , plural: 'Cups per second'
            }
            , to_anchor: 8
        }
        , 'pnt/s': {
            name: {
                singular: 'Pint per second'
                , plural: 'Pints per second'
            }
            , to_anchor: 16
        }
        , 'pnt/min': {
            name: {
                singular: 'Pint per minute'
                , plural: 'Pints per minute'
            }
            , to_anchor: 4 / 15
        }
        , 'pnt/h': {
            name: {
                singular: 'Pint per hour'
                , plural: 'Pints per hour'
            }
            , to_anchor: 1 / 225
        }
        , 'qt/s': {
            name: {
                singular: 'Quart per second'
                , plural: 'Quarts per second'
            }
            , to_anchor: 32
        }
        , 'gal/s': {
            name: {
                singular: 'Gallon per second'
                , plural: 'Gallons per second'
            }
            , to_anchor: 128
        }
        , 'gpm': {
            name: {
                singular: 'Gallon per minute'
                , plural: 'Gallons per minute'
            }
            , to_anchor: 32 / 15
        },
        'MGD':
        {
            name: {
                singular: 'Million Gallon per day',
                plural: 'Million Gallons per day'
            },
            to_anchor: 128000000 / 86400

        }
        , 'gal/h': {
            name: {
                singular: 'Gallon per hour'
                , plural: 'Gallons per hour'
            }
            , to_anchor: 8 / 225
        }
        , 'ft3/s': {
            name: {
                singular: 'Cubic foot per second'
                , plural: 'Cubic feet per second',
                 display:  'ft&‌#x00B3;/s'
            }
            , to_anchor: 957.506
        }
        , 'ft3/min': {
            name: {
                singular: 'Cubic foot per minute'
                , plural: 'Cubic feet per minute'
            }
            , to_anchor: 957.506 / 60
        }
        , 'ft3/h': {
            name: {
                singular: 'Cubic foot per hour'
                , plural: 'Cubic feet per hour',
                 display:  'ft&‌#x00B3;/h'
            }
            , to_anchor: 957.506 / 3600
        }
        , 'yd3/s': {
            name: {
                singular: 'Cubic yard per second'
                , plural: 'Cubic yards per second',
                 display:  'yd&‌#x00B3;/s'
            }
            , to_anchor: 25852.7
        }
        , 'yd3/min': {
            name: {
                singular: 'Cubic yard per minute'
                , plural: 'Cubic yards per minute',
                 display:  'yd&‌#x00B3/min;'
            }
            , to_anchor: 25852.7 / 60
        }
        , 'yd3/h': {
            name: {
                singular: 'Cubic yard per hour'
                , plural: 'Cubic yards per hour',
                 display:  'yd&‌#x00B3;/h'
            }
            , to_anchor: 25852.7 / 3600
        }
    }
    , _anchors: {
        metric: {
            unit: 'L/s'
            , ratio: 33.8140227
        }
        , imperial: {
            unit: 'fl-oz/s'
            , ratio: 1 / 33.8140227
        }
    }
};
