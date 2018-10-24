export const pressure = {
  metric: {
    kPa: {
      name: {
        singular: 'Kilopascal'
        , plural: 'KiloPascals',
        display: '(kPa)'
      }
      , to_anchor: 1
    }
    , Pa: {
      name: {
        singular: 'Pascal'
        , plural: 'Pascals',
        display: '(Pa)'
      }
      , to_anchor: 1 / 1000
    }
    , MPa: {
      name: {
        singular: 'Megapascal'
        , plural: 'Megapascals',
        display: '(MPa)'
      }
      , to_anchor: 1000
    }
    , kPag: {
      name: {
        singular: 'Kilopascal gauge'
        , plural: 'Kilopascals gauge',
        display: '(kPag)'
      }
      , to_anchor: 1
      , anchor_shift: -101.325
    }
    , kPaa: {
      name: {
        singular: 'Kilopascal absolute'
        , plural: 'Kilopascals absolute',
        display: '(kPaa)'
      }
      , to_anchor: 1
    }
    , MPag: {
      name: {
        singular: 'Megapascal gauge'
        , plural: 'Megapascals',
        display: '(MPa)'
      }
      , to_anchor: 1000
      , anchor_shift: -101.325
    }
    , MPaa: {
      name: {
        singular: 'Megapascal absolute'
        , plural: 'Megapascals absolute',
        display: '(MPaa)'
      }
      , to_anchor: 1000

    }
    ,hPa: {
      name: {
        singular: 'Hectopascal'
        , plural: 'Hectopascals',
        display: '(hPa)'
      }
      , to_anchor: 1 / 10
    }
    , bar: {
      name: {
        singular: 'Bar'
        , plural: 'Bar',
        display: '(bar)'
      }
      , to_anchor: 100
    },
    bara: {
      name: {
        singular: 'Bar absolute'
        , plural: 'Bar absolute',
        display: '(bara)'
      }
      , to_anchor: 100
    }
    , barg: {
      name: {
        singular: 'Bar gauge'
        , plural: 'Bar gauge',
        display: '(bar)'
      }
      , to_anchor: 100
      , anchor_shift: -101.325
    }
    , torr: {
      name: {
        singular: 'Torr'
        , plural: 'Torr',
        display: '(torr)'
      }
      , to_anchor: 101325 / 760000
    }
    , atm: {
      name: {
        singular: 'Atmosphere'
        , plural: 'Atmospheres',
        display: '(atm)'
      }
      , to_anchor: 101.325
    }
    , mmHg: {
      name: {
        singular: 'Milimeter of Mercury'
        , plural: 'Milimeters of Mercury',
        display: '(mm Hg)'
      }
      , to_anchor: 0.133322
    }
    , mH2o: {
      name: {
        singular: 'Meter of Water'
        , plural: 'Meters of Water',
        display: '(m H₂O)'
      }
      , to_anchor: 9.8064
    },
    mmH2o: {
      name: {
        singular: 'Millimeter of Water'
        , plural: 'Millimeters of Water',
        display: '(mm H₂O)'
      }
      , to_anchor: 0.00980665
    },
    ftH2o: {
      name: {
        singular: 'Foot of Water'
        , plural: 'Feet of Water',
        display: '(ft H&#x2082;O)'
      }
      , to_anchor: 2.98898
    },
    inHg: {
      name: {
        singular: 'Inch of Mercury',
        plural: 'Inches of Mercury',
        display: '(in Hg)'
      },
      to_anchor: 3.38639
    }
  }
  , imperial: {
    psi: {
      name: {
        singular: 'Pound per Square Inch'
        , plural: 'Pounds per Square Inch',
        display: '(psi)'
      }
      , to_anchor: 1 / 1000
    },
    psia: {
      name: {
        singular: 'Pound per Square Inch absolute'
        , plural: 'Pounds per Square Inch absolute',
        display: '(psia)'
      }
      , to_anchor: 1 / 1000
    }
    ,  psig: {
        name: {
          singular: 'Pound per Square Inch gauge'
          , plural: 'Pounds per Square Inch gauge',
          display: '(psig)'
        }
        , to_anchor: 1 / 1000
        , anchor_shift: -14.696 / 1000
      }
    , ksi: {
      name: {
        singular: 'Kilopound per Square Inch'
        , plural: 'Kilopounds per Square Inch',
        display: '(ksi)'
      }
      , to_anchor: 1
    },
    inH2o: {
      name: {
        singular: 'Inch of Water'
        , plural: 'Inches of Water',
        display: '(in H&#x2082;O)'
      }
      , to_anchor: 1 / 27707.6
    }
  },
  _anchors: {
    metric: {
      unit: 'kPa'
      , ratio: 0.00014503768078
    }
    , imperial: {
      unit: 'psi'
      , ratio: 1 / 0.00014503768078
    }
  }
}
