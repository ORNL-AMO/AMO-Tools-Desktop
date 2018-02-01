export const volume = {
    metric: {
        mm3: {
            name: {
                singular: 'Cubic Millimeter'
                , plural: 'Cubic Millimeters',
                 display:  '(mm&#x00B3;)'
            }
            , to_anchor: 1 / 1000000
        }
        , cm3: {
            name: {
                singular: 'Cubic Centimeter'
                , plural: 'Cubic Centimeters',
                display:  '(cm&#x00B3;)'
            }
            , to_anchor: 1 / 1000
        }
        , mL: {
            name: {
                singular: 'Milliliter'
                , plural: 'Milliliters' ,
                 display:  '(mL)'
            }
            , to_anchor: 1 / 1000
        }
        , cL: {
            name: {
                singular: 'Centiliter'
                , plural: 'Centiliters' ,
                 display:  '(cL)'
            }
            , to_anchor: 1 / 100
        }
        , dL: {
            name: {
                singular: 'Deciliter'
                , plural: 'Deciliters' ,
              display:  '(dL)'
            }
            , to_anchor: 1 / 10
        }
        , L: {
            name: {
                singular: 'Liter'
                , plural: 'Liters' ,
                 display:  '(L)'
            }
            , to_anchor: 1
        }
        , m3: {
            name: {
                singular: 'Cubic meter'
                , plural: 'Cubic meters',
                 display:  '(m&#x00B3;)'
            }
            , to_anchor: 1000
        }
        , km3: {
            name: {
                singular: 'Cubic kilometer'
                , plural: 'Cubic kilometers',
                 display:  '(km&#x00B3;)'
            }
            , to_anchor: 1000000000000
        }

        // Swedish units
        , krm: {
            name: {
                singular: 'Matsked'
                , plural: 'Matskedar' ,
              display:  '(krm)'
            }
            , to_anchor: 1 / 1000
        }
        , tsk: {
            name: {
                singular: 'Tesked'
                , plural: 'Teskedar' ,
                 display:  '(tsk)'
            }
            , to_anchor: 5 / 1000
        }
        , msk: {
            name: {
                singular: 'Matsked'
                , plural: 'Matskedar' ,
                 display:  '(msk)'
            }
            , to_anchor: 15 / 1000
        }
        , kkp: {
            name: {
                singular: 'Kaffekopp'
                , plural: 'Kaffekoppar' ,
                 display:  '(kkp)'
            }
            , to_anchor: 150 / 1000
        }
        , glas: {
            name: {
                singular: 'Glas'
                , plural: 'Glas' ,
                 display:  '(glas)'
            }
            , to_anchor: 200 / 1000
        }
        , kanna: {
            name: {
                singular: 'Kanna'
                , plural: 'Kannor' ,
                 display:  '(kanna)'
            }
            , to_anchor: 2.617
        }
    },

    imperial: {
        tsp: {
            name: {
                singular: 'Teaspoon'
                , plural: 'Teaspoons' ,
                 display:  '(tsp)'
            }
            , to_anchor: 1 / 6
        }
        , Tbs: {
            name: {
                singular: 'Tablespoon'
                , plural: 'Tablespoons' ,
                 display:  '(Tbs)'
            }
            , to_anchor: 1 / 2
        }
        , in3: {
            name: {
                singular: 'Cubic inch'
                , plural: 'Cubic inches',
                 display:  '(in&#x00B3;)'
            }
            , to_anchor: 0.55411
        }
        , 'fl-oz': {
            name: {
                singular: 'Fluid Ounce'
                , plural: 'Fluid Ounces' ,
                 display:  '(fl-oz)'
            }
            , to_anchor: 1
        }
        , cup: {
            name: {
                singular: 'Cup'
                , plural: 'Cups' ,
              display:  '(cup)'
            }
            , to_anchor: 8
        }
        , pnt: {
            name: {
                singular: 'Pint'
                , plural: 'Pints' ,
                 display:  '(pnt)'
            }
            , to_anchor: 16
        }
        , qt: {
            name: {
                singular: 'Quart'
                , plural: 'Quarts' ,
                 display:  '(qt)'
            }
            , to_anchor: 32
        }
        , gal: {
            name: {
                singular: 'U.S. Gallon'
                , plural: 'U.S. Gallons' ,
                 display:  '(gal)'
            }
            , to_anchor: 128
        }
        , ft3: {
            name: {
                singular: 'Cubic foot'
                , plural: 'Cubic feet' ,
                 display:  '(ft&#x00B3;)'
            }
            , to_anchor: 957.506
        }
        , yd3: {
            name: {
                singular: 'Cubic yard'
                , plural: 'Cubic yards',
                 display:  '(yd&#x00B3;)'
            }
            , to_anchor: 25852.7

        }
        , 'impgal': {
          name: {
            singular: 'Imperial Gallon'
            , plural: 'Imperial Gallons',
            display:  '(imp gal)'
          }
          , to_anchor: 153.722
        }
    },
    _anchors: {
        metric: {
            unit: 'L'
            , ratio: 33.8140226
        }
        , imperial: {
            unit: 'fl-oz'
            , ratio: 1 / 33.8140226
        }
    }
}
